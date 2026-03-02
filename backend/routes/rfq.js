const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const RFQ = require('../models/RFQ');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { protect, isBuyer, isSupplier } = require('../middleware/auth');

// @route   GET /api/rfq
// @desc    Get RFQs (filtered by role)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    let query = {};

    // Filter by user role
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      if (supplier) {
        // Get RFQs where this supplier is targeted or has quoted
        query.$or = [
          { supplierId: supplier._id },
          { 'quotes.supplierId': supplier._id },
          { supplierId: { $exists: false } } // Open RFQs
        ];
      }
    }

    if (status) query.status = status;

    const rfqs = await RFQ.find(query)
      .populate('buyerId', 'name company')
      .populate('supplierId', 'companyName logo')
      .populate('productId', 'name images price')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

    const total = await RFQ.countDocuments(query);

    res.json({
      success: true,
      data: {
        rfqs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rfq/:id
// @desc    Get single RFQ
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id)
      .populate('buyerId', 'name company email phone')
      .populate('supplierId', 'companyName logo contactInfo')
      .populate('productId', 'name images price moq unit bulkPricing')
      .populate('quotes.supplierId', 'companyName logo rating');

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check authorization
    const isBuyer = rfq.buyerId._id.toString() === req.user._id.toString();
    let isTargetedSupplier = false;

    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      if (supplier) {
        isTargetedSupplier = rfq.supplierId?._id.toString() === supplier._id.toString() ||
          rfq.quotes.some(q => q.supplierId._id.toString() === supplier._id.toString());
      }
    }

    if (!isBuyer && !isTargetedSupplier && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this RFQ'
      });
    }

    res.json({
      success: true,
      data: { rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rfq
// @desc    Create a new RFQ
// @access  Private/Buyer
router.post('/', protect, isBuyer, [
  body('productName').trim().notEmpty().withMessage('Product name is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('deliveryAddress.country').notEmpty().withMessage('Delivery country is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      productId,
      productName,
      productDescription,
      productImage,
      supplierId,
      quantity,
      unit,
      targetPrice,
      currency,
      deliveryAddress,
      preferredDeliveryDate,
      shippingTerms,
      requirements
    } = req.body;

    // If productId is provided, get product details
    let productData = { productName, productDescription, productImage };
    if (productId) {
      const product = await Product.findById(productId);
      if (product) {
        productData = {
          productId: product._id,
          productName: product.name,
          productDescription: product.description,
          productImage: product.images?.[0]?.url || product.image
        };
      }
    }

    const rfqData = {
      buyerId: req.user._id,
      ...productData,
      supplierId,
      quantity,
      unit: unit || 'piece',
      targetPrice,
      currency: currency || 'USD',
      deliveryAddress,
      preferredDeliveryDate,
      shippingTerms,
      requirements
    };

    const rfq = await RFQ.create(rfqData);

    // Update product inquiry count
    if (productId) {
      await Product.findByIdAndUpdate(productId, { $inc: { inquiryCount: 1 } });
    }

    // Update supplier active RFQs count
    if (supplierId) {
      await Supplier.findByIdAndUpdate(supplierId, { $inc: { 'stats.activeRFQs': 1 } });
    }

    res.status(201).json({
      success: true,
      message: 'RFQ submitted successfully',
      data: { rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/rfq/:id/quote
// @desc    Submit a quote for an RFQ
// @access  Private/Supplier
router.post('/:id/quote', protect, isSupplier, [
  body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
  body('leadTime').notEmpty().withMessage('Lead time is required'),
  body('validUntil').isISO8601().withMessage('Valid expiration date is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.status === 'closed' || rfq.status === 'cancelled' || rfq.status === 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit quote for this RFQ'
      });
    }

    // Check if supplier already submitted a quote
    const existingQuote = rfq.quotes.find(
      q => q.supplierId.toString() === supplier._id.toString()
    );

    if (existingQuote) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a quote for this RFQ'
      });
    }

    const { unitPrice, leadTime, validUntil, notes } = req.body;

    const quote = {
      supplierId: supplier._id,
      unitPrice,
      totalPrice: unitPrice * rfq.quantity,
      leadTime,
      validUntil: new Date(validUntil),
      notes,
      status: 'pending',
      submittedAt: new Date()
    };

    rfq.quotes.push(quote);
    rfq.status = 'quoted';
    rfq.lastActivity = new Date();
    await rfq.save();

    res.status(201).json({
      success: true,
      message: 'Quote submitted successfully',
      data: { quote, rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rfq/:rfqId/quote/:quoteId/accept
// @desc    Accept a quote
// @access  Private/Buyer (owner only)
router.put('/:rfqId/quote/:quoteId/accept', protect, isBuyer, async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    // Check ownership
    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const quote = rfq.quotes.id(req.params.quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Quote is not pending'
      });
    }

    // Accept this quote
    quote.status = 'accepted';
    rfq.status = 'accepted';
    rfq.acceptedQuote = quote._id;
    rfq.lastActivity = new Date();

    // Reject other quotes
    rfq.quotes.forEach(q => {
      if (q._id.toString() !== quote._id.toString() && q.status === 'pending') {
        q.status = 'rejected';
      }
    });

    await rfq.save();

    res.json({
      success: true,
      message: 'Quote accepted successfully',
      data: { rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rfq/:rfqId/quote/:quoteId/reject
// @desc    Reject a quote
// @access  Private/Buyer (owner only)
router.put('/:rfqId/quote/:quoteId/reject', protect, isBuyer, async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.rfqId);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const quote = rfq.quotes.id(req.params.quoteId);

    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    quote.status = 'rejected';
    rfq.lastActivity = new Date();

    // Check if all quotes are rejected
    const pendingQuotes = rfq.quotes.filter(q => q.status === 'pending');
    if (pendingQuotes.length === 0 && rfq.quotes.length > 0) {
      rfq.status = 'open'; // Reopen for more quotes
    }

    await rfq.save();

    res.json({
      success: true,
      message: 'Quote rejected',
      data: { rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rfq/:id/cancel
// @desc    Cancel an RFQ
// @access  Private/Buyer (owner only)
router.put('/:id/cancel', protect, isBuyer, async (req, res, next) => {
  try {
    const rfq = await RFQ.findById(req.params.id);

    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }

    if (rfq.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (rfq.status === 'accepted' || rfq.status === 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this RFQ'
      });
    }

    rfq.status = 'cancelled';
    rfq.lastActivity = new Date();
    await rfq.save();

    res.json({
      success: true,
      message: 'RFQ cancelled',
      data: { rfq }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rfq/stats/buyer
// @desc    Get RFQ statistics for buyer
// @access  Private/Buyer
router.get('/stats/buyer', protect, isBuyer, async (req, res, next) => {
  try {
    const stats = await RFQ.aggregate([
      { $match: { buyerId: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalQuotes = await RFQ.aggregate([
      { $match: { buyerId: req.user._id } },
      { $unwind: '$quotes' },
      { $count: 'total' }
    ]);

    res.json({
      success: true,
      data: {
        byStatus: stats,
        totalQuotesReceived: totalQuotes[0]?.total || 0
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

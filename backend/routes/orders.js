const express = require('express');
const router = express.Router();
const { body, validationResult, query } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const RFQ = require('../models/RFQ');
const { protect, isBuyer, isSupplier, authorize } = require('../middleware/auth');

// Generate unique order number
const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`;
  
  const lastOrder = await Order.findOne({ orderNumber: new RegExp(`^${prefix}`) })
    .sort({ createdAt: -1 });
  
  let sequence = 1;
  if (lastOrder && lastOrder.orderNumber) {
    const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop());
    sequence = lastSeq + 1;
  }
  
  return `${prefix}-${String(sequence).padStart(5, '0')}`;
};

// @route   GET /api/orders
// @desc    Get orders for current user (buyer or supplier)
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      sortBy = 'createdAt',
      sortOrder = 'desc' 
    } = req.query;

    let query = {};

    // Filter by user role
    if (req.user.role === 'buyer') {
      query.buyerId = req.user._id;
    } else if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      if (supplier) {
        query.supplierId = supplier._id;
      }
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // Sort configuration
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const orders = await Order.find(query)
      .populate('buyerId', 'name email company')
      .populate('supplierId', 'businessName companyInfo.logo')
      .populate('items.productId', 'name images')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sortOptions);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        orders,
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

// @route   GET /api/orders/stats
// @desc    Get order statistics for dashboard
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'buyer') {
      matchQuery.buyerId = req.user._id;
    } else if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      if (supplier) {
        matchQuery.supplierId = supplier._id;
      }
    }

    const stats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          processingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'processing'] }, 1, 0] }
          },
          shippedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          deliveredOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          },
          cancelledOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get monthly stats
    const monthlyStats = await Order.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        summary: stats[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          processingOrders: 0,
          shippedOrders: 0,
          deliveredOrders: 0,
          cancelledOrders: 0
        },
        monthlyStats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order details
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email company phone')
      .populate('supplierId', 'businessName companyInfo contactInfo')
      .populate('items.productId', 'name images sku')
      .populate('rfqId');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isOwner = order.buyerId._id.toString() === req.user._id.toString();
    let isSupplierOwner = false;
    
    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      isSupplierOwner = supplier && order.supplierId._id.toString() === supplier._id.toString();
    }

    if (!isOwner && !isSupplierOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer)
router.post('/', protect, isBuyer, [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('shippingAddress').notEmpty().withMessage('Shipping address is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { items, shippingAddress, billingAddress, paymentMethod, notes, rfqId } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    let supplierId = null;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.productId}`
        });
      }

      // Check stock
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      // Check MOQ
      if (product.moq && item.quantity < product.moq) {
        return res.status(400).json({
          success: false,
          message: `Minimum order quantity for ${product.name} is ${product.moq}`
        });
      }

      // All items must be from same supplier
      if (supplierId && product.supplier.toString() !== supplierId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'All items in an order must be from the same supplier'
        });
      }
      supplierId = product.supplier;

      // Calculate price (consider bulk pricing)
      let unitPrice = product.price;
      if (product.bulkPricing && product.bulkPricing.length > 0) {
        const applicableTier = product.bulkPricing
          .filter(tier => item.quantity >= tier.minQuantity)
          .sort((a, b) => b.minQuantity - a.minQuantity)[0];
        
        if (applicableTier) {
          unitPrice = applicableTier.price;
        }
      }

      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        totalPrice: itemTotal
      });
    }

    // Calculate shipping and tax (simplified)
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over $1000
    const tax = subtotal * 0.1; // 10% tax
    const totalAmount = subtotal + shippingCost + tax;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = new Order({
      orderNumber,
      buyerId: req.user._id,
      supplierId,
      rfqId,
      items: orderItems,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: paymentMethod || 'bank_transfer',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      timeline: [
        {
          status: 'pending',
          note: 'Order placed',
          updatedBy: req.user._id
        }
      ]
    });

    await order.save();

    // Update product stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: -item.quantity }
      });
    }

    // Update supplier metrics
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { 
        'metrics.totalOrders': 1,
        'metrics.totalRevenue': totalAmount
      }
    });

    // Populate for response
    await order.populate([
      { path: 'buyerId', select: 'name email' },
      { path: 'supplierId', select: 'businessName' },
      { path: 'items.productId', select: 'name images' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/orders/from-rfq/:rfqId/:quoteId
// @desc    Create order from accepted RFQ quote
// @access  Private (Buyer)
router.post('/from-rfq/:rfqId/:quoteId', protect, isBuyer, [
  body('shippingAddress').notEmpty().withMessage('Shipping address is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { rfqId, quoteId } = req.params;
    const { shippingAddress, billingAddress, notes } = req.body;

    // Find RFQ
    const rfq = await RFQ.findById(rfqId);
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

    // Find accepted quote
    const quote = rfq.quotes.id(quoteId);
    if (!quote) {
      return res.status(404).json({
        success: false,
        message: 'Quote not found'
      });
    }

    if (quote.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Quote must be accepted before creating order'
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order items from RFQ
    const orderItems = [{
      productId: rfq.productInfo.productId,
      productName: rfq.productInfo.productName,
      quantity: rfq.quantity,
      unitPrice: quote.pricePerUnit,
      totalPrice: quote.totalPrice
    }];

    // Create order
    const order = new Order({
      orderNumber,
      buyerId: req.user._id,
      supplierId: quote.supplierId,
      rfqId: rfq._id,
      items: orderItems,
      subtotal: quote.totalPrice,
      shippingCost: quote.shippingCost || 0,
      tax: quote.totalPrice * 0.1,
      totalAmount: quote.totalPrice + (quote.shippingCost || 0) + (quote.totalPrice * 0.1),
      currency: quote.currency || 'USD',
      status: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'bank_transfer',
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      notes,
      timeline: [
        {
          status: 'pending',
          note: `Order created from RFQ #${rfq.rfqNumber}`,
          updatedBy: req.user._id
        }
      ]
    });

    await order.save();

    // Update RFQ status to awarded
    rfq.status = 'awarded';
    await rfq.save();

    // Populate for response
    await order.populate([
      { path: 'buyerId', select: 'name email' },
      { path: 'supplierId', select: 'businessName' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created from RFQ successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Supplier/Admin)
// @access  Private
router.put('/:id/status', protect, [
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, note, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    let authorized = false;
    if (req.user.role === 'admin') {
      authorized = true;
    } else if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      authorized = supplier && order.supplierId.toString() === supplier._id.toString();
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Validate status transition
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: []
    };

    if (!validTransitions[order.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${order.status} to ${status}`
      });
    }

    // Update order
    order.status = status;
    
    if (trackingNumber) {
      order.shipping = order.shipping || {};
      order.shipping.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
      order.shipping = order.shipping || {};
      order.shipping.estimatedDelivery = new Date(estimatedDelivery);
    }

    if (status === 'shipped' && trackingNumber) {
      order.shipping.shippedAt = new Date();
    }

    if (status === 'delivered') {
      order.shipping = order.shipping || {};
      order.shipping.deliveredAt = new Date();
    }

    // Add to timeline
    order.timeline.push({
      status,
      note: note || `Status updated to ${status}`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/payment
// @desc    Update payment status
// @access  Private (Supplier/Admin)
router.put('/:id/payment', protect, [
  body('paymentStatus').isIn(['pending', 'partial', 'paid', 'refunded'])
    .withMessage('Invalid payment status')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { paymentStatus, transactionId, paidAmount, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    let authorized = false;
    if (req.user.role === 'admin') {
      authorized = true;
    } else if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      authorized = supplier && order.supplierId.toString() === supplier._id.toString();
    }

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    order.paymentStatus = paymentStatus;
    
    if (transactionId) {
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.transactionId = transactionId;
    }
    
    if (paidAmount) {
      order.paymentDetails = order.paymentDetails || {};
      order.paymentDetails.paidAmount = paidAmount;
      order.paymentDetails.paidAt = new Date();
    }

    // Add to timeline
    order.timeline.push({
      status: order.status,
      note: note || `Payment status updated to ${paymentStatus}`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Payment status updated',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
router.put('/:id/cancel', protect, [
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isBuyerOwner = order.buyerId.toString() === req.user._id.toString();
    let isSupplierOwner = false;
    
    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      isSupplierOwner = supplier && order.supplierId.toString() === supplier._id.toString();
    }

    if (!isBuyerOwner && !isSupplierOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if can be cancelled
    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Order with status "${order.status}" cannot be cancelled`
      });
    }

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stockQuantity: item.quantity }
      });
    }

    // Update order
    order.status = 'cancelled';
    order.cancellation = {
      cancelledBy: req.user._id,
      cancelledAt: new Date(),
      reason
    };

    order.timeline.push({
      status: 'cancelled',
      note: `Order cancelled: ${reason}`,
      updatedBy: req.user._id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Generate invoice for order
// @access  Private
router.get('/:id/invoice', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'name email company phone address')
      .populate('supplierId', 'businessName companyInfo contactInfo')
      .populate('items.productId', 'name sku');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isBuyerOwner = order.buyerId._id.toString() === req.user._id.toString();
    let isSupplierOwner = false;
    
    if (req.user.role === 'supplier') {
      const supplier = await Supplier.findOne({ userId: req.user._id });
      isSupplierOwner = supplier && order.supplierId._id.toString() === supplier._id.toString();
    }

    if (!isBuyerOwner && !isSupplierOwner && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Generate invoice data
    const invoice = {
      invoiceNumber: `INV-${order.orderNumber}`,
      orderNumber: order.orderNumber,
      date: order.createdAt,
      dueDate: new Date(order.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000), // 30 days
      buyer: {
        name: order.buyerId.name,
        email: order.buyerId.email,
        company: order.buyerId.company,
        address: order.shippingAddress
      },
      supplier: {
        name: order.supplierId.businessName,
        address: order.supplierId.companyInfo?.address,
        contact: order.supplierId.contactInfo
      },
      items: order.items.map(item => ({
        name: item.productName,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice
      })),
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      tax: order.tax,
      totalAmount: order.totalAmount,
      currency: order.currency,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus
    };

    res.json({
      success: true,
      data: { invoice }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

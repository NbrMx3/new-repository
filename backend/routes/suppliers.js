const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, optionalAuth, isSupplier } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/suppliers
// @desc    Get all suppliers with filtering
// @access  Public
router.get('/', async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      country,
      category,
      verified,
      search,
      sort = '-rating.overall'
    } = req.query;

    const queryObj = { status: 'active' };

    if (country) queryObj['location.country'] = country;
    if (category) queryObj.mainCategories = category;
    if (verified === 'true') {
      queryObj['verification.status'] = { $in: ['verified', 'gold', 'premium'] };
    }

    if (search) {
      queryObj.$text = { $search: search };
    }

    const suppliers = await Supplier.find(queryObj)
      .populate('userId', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Supplier.countDocuments(queryObj);

    res.json({
      success: true,
      data: {
        suppliers,
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

// @route   GET /api/suppliers/me
// @desc    Get current supplier's profile
// @access  Private/Supplier
router.get('/me', protect, isSupplier, async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id })
      .populate('userId', 'name email phone');

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/suppliers/dashboard
// @desc    Get supplier dashboard data
// @access  Private/Supplier
router.get('/dashboard', protect, isSupplier, async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    // Get product stats
    const productStats = await Product.aggregate([
      { $match: { supplierId: supplier._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent products
    const recentProducts = await Product.find({ supplierId: supplier._id })
      .sort('-createdAt')
      .limit(5);

    // Calculate profile completeness
    supplier.calculateCompleteness();
    await supplier.save();

    res.json({
      success: true,
      data: {
        supplier,
        productStats,
        recentProducts,
        stats: supplier.stats
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/suppliers/:id
// @desc    Get supplier by ID (public profile)
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id)
      .populate('userId', 'name createdAt');

    if (!supplier || supplier.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Get supplier's products
    const products = await Product.find({
      supplierId: supplier._id,
      status: 'active'
    })
      .limit(12)
      .sort('-createdAt');

    res.json({
      success: true,
      data: {
        supplier,
        products
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/suppliers
// @desc    Create supplier profile
// @access  Private/Supplier
router.post('/', protect, [
  body('companyName').trim().notEmpty().withMessage('Company name is required'),
  body('businessType').isIn(['manufacturer', 'trading', 'wholesaler', 'distributor', 'retailer'])
    .withMessage('Valid business type is required'),
  body('location.country').notEmpty().withMessage('Country is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if supplier profile already exists
    const existingSupplier = await Supplier.findOne({ userId: req.user._id });
    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile already exists'
      });
    }

    const supplierData = {
      ...req.body,
      userId: req.user._id
    };

    const supplier = await Supplier.create(supplierData);

    // Update user role if needed
    if (req.user.role !== 'supplier') {
      await User.findByIdAndUpdate(req.user._id, { role: 'supplier' });
    }

    // Calculate initial completeness
    supplier.calculateCompleteness();
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier profile created successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/suppliers/me
// @desc    Update supplier profile
// @access  Private/Supplier
router.put('/me', protect, isSupplier, async (req, res, next) => {
  try {
    let supplier = await Supplier.findOne({ userId: req.user._id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'companyName', 'description', 'businessType', 'yearEstablished',
      'employeeCount', 'annualRevenue', 'location', 'contactInfo',
      'mainCategories', 'mainProducts', 'capabilities', 'certifications'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    supplier = await Supplier.findByIdAndUpdate(
      supplier._id,
      updates,
      { new: true, runValidators: true }
    );

    // Recalculate completeness
    supplier.calculateCompleteness();
    await supplier.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { supplier }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/suppliers/logo
// @desc    Upload supplier logo
// @access  Private/Supplier
router.post('/logo', protect, isSupplier, upload.avatar, async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const logoUrl = `/uploads/images/${req.file.filename}`;

    const supplier = await Supplier.findOneAndUpdate(
      { userId: req.user._id },
      { logo: logoUrl },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logo: logoUrl, supplier }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/suppliers/verification
// @desc    Request verification
// @access  Private/Supplier
router.post('/verification', protect, isSupplier, async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    if (supplier.verification.status !== 'unverified') {
      return res.status(400).json({
        success: false,
        message: 'Verification already requested or completed'
      });
    }

    supplier.verification.status = 'pending';
    await supplier.save();

    res.json({
      success: true,
      message: 'Verification request submitted',
      data: { verificationStatus: supplier.verification.status }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/suppliers/:id/products
// @desc    Get supplier's products
// @access  Public
router.get('/:id/products', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, sort = '-createdAt' } = req.query;

    const query = { supplierId: req.params.id, status: 'active' };
    if (category) query.category = category;

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      data: {
        products,
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

module.exports = router;

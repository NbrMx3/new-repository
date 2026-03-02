const express = require('express');
const router = express.Router();
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const { protect, optionalAuth, isSupplier } = require('../middleware/auth');
const upload = require('../middleware/upload');

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      supplierId,
      search,
      sort = '-createdAt',
      inStock,
      featured
    } = req.query;

    // Build query
    const queryObj = { status: 'active' };

    if (category) queryObj.category = category;
    if (supplierId) queryObj.supplierId = supplierId;
    if (inStock === 'true') queryObj.inStock = true;
    if (featured === 'true') queryObj.featured = true;

    // Price range
    if (minPrice || maxPrice) {
      queryObj.price = {};
      if (minPrice) queryObj.price.$gte = parseFloat(minPrice);
      if (maxPrice) queryObj.price.$lte = parseFloat(maxPrice);
    }

    // Text search
    if (search) {
      queryObj.$text = { $search: search };
    }

    // Execute query
    const products = await Product.find(queryObj)
      .populate('supplierId', 'companyName logo verification.status rating')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort(sort);

    const total = await Product.countDocuments(queryObj);

    // Get categories for filters
    const categories = await Product.distinct('category', { status: 'active' });

    res.json({
      success: true,
      data: {
        products,
        categories,
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

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', async (req, res, next) => {
  try {
    const products = await Product.find({ featured: true, status: 'active' })
      .populate('supplierId', 'companyName logo verification.status')
      .limit(12)
      .sort('-createdAt');

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories
// @access  Public
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('supplierId', 'companyName logo description verification rating contactInfo location');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount += 1;
    await product.save();

    // Get related products
    const relatedProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category,
      status: 'active'
    })
      .populate('supplierId', 'companyName logo')
      .limit(6);

    res.json({
      success: true,
      data: {
        product,
        relatedProducts
      }
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private/Supplier
router.post('/', protect, isSupplier, [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price is required'),
  body('category').trim().notEmpty().withMessage('Category is required')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Get supplier profile
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    const productData = {
      ...req.body,
      supplierId: supplier._id
    };

    const product = await Product.create(productData);

    // Update supplier product count
    supplier.stats.totalProducts += 1;
    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private/Supplier (owner only)
router.put('/:id', protect, isSupplier, async (req, res, next) => {
  try {
    // Get supplier profile
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private/Supplier (owner only)
router.delete('/:id', protect, isSupplier, async (req, res, next) => {
  try {
    // Get supplier profile
    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    await product.deleteOne();

    // Update supplier product count
    supplier.stats.totalProducts = Math.max(0, supplier.stats.totalProducts - 1);
    await supplier.save();

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/products/:id/images
// @desc    Upload product images
// @access  Private/Supplier (owner only)
router.post('/:id/images', protect, isSupplier, upload.productImages, async (req, res, next) => {
  try {
    const supplier = await Supplier.findOne({ userId: req.user._id });
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (product.supplierId.toString() !== supplier._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image'
      });
    }

    const newImages = req.files.map((file, index) => ({
      url: `/uploads/images/${file.filename}`,
      alt: product.name,
      isPrimary: product.images.length === 0 && index === 0
    }));

    product.images.push(...newImages);
    await product.save();

    res.json({
      success: true,
      message: 'Images uploaded successfully',
      data: { images: product.images }
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/products/supplier/my-products
// @desc    Get current supplier's products
// @access  Private/Supplier
router.get('/supplier/my-products', protect, isSupplier, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const supplier = await Supplier.findOne({ userId: req.user._id });
    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: 'Supplier profile not found'
      });
    }

    const query = { supplierId: supplier._id };
    if (status) query.status = status;

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort('-createdAt');

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

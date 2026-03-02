const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  subcategory: {
    type: String,
    trim: true
  },
  images: [{
    url: String,
    alt: String,
    isPrimary: { type: Boolean, default: false }
  }],
  // B2B specific fields
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  moq: {
    type: Number,
    default: 1,
    min: [1, 'MOQ must be at least 1']
  },
  unit: {
    type: String,
    default: 'piece',
    enum: ['piece', 'set', 'kg', 'meter', 'box', 'dozen', 'carton', 'pallet']
  },
  bulkPricing: [{
    minQty: { type: Number, required: true },
    maxQty: Number,
    price: { type: Number, required: true }
  }],
  leadTime: {
    type: String,
    default: '7-14 days'
  },
  specifications: {
    type: Map,
    of: String
  },
  packagingDetails: {
    type: String
  },
  customization: {
    available: { type: Boolean, default: false },
    options: [String],
    minQtyForCustom: Number
  },
  sampleAvailable: {
    type: Boolean,
    default: false
  },
  samplePrice: {
    type: Number
  },
  // Inventory
  inStock: {
    type: Boolean,
    default: true
  },
  stockQuantity: {
    type: Number,
    default: 0
  },
  // Ratings & Reviews
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  // SEO & Search
  tags: [String],
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'outOfStock'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  inquiryCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better search performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ supplierId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ createdAt: -1 });

// Virtual for primary image
productSchema.virtual('image').get(function() {
  const primaryImage = this.images?.find(img => img.isPrimary);
  return primaryImage?.url || this.images?.[0]?.url || null;
});

// Virtual populate supplier info
productSchema.virtual('supplier', {
  ref: 'Supplier',
  localField: 'supplierId',
  foreignField: '_id',
  justOne: true
});

// Calculate discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Get price for quantity (bulk pricing)
productSchema.methods.getPriceForQuantity = function(quantity) {
  if (!this.bulkPricing || this.bulkPricing.length === 0) {
    return this.price;
  }
  
  const sortedTiers = [...this.bulkPricing].sort((a, b) => b.minQty - a.minQty);
  const applicableTier = sortedTiers.find(tier => quantity >= tier.minQty);
  
  return applicableTier ? applicableTier.price : this.price;
};

module.exports = mongoose.model('Product', productSchema);

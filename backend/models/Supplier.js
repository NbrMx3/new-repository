const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [200, 'Company name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  logo: {
    type: String
  },
  coverImage: {
    type: String
  },
  // Business Information
  businessType: {
    type: String,
    enum: ['manufacturer', 'trading', 'wholesaler', 'distributor', 'retailer'],
    required: true
  },
  yearEstablished: {
    type: Number
  },
  employeeCount: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+']
  },
  annualRevenue: {
    type: String,
    enum: ['<$1M', '$1M-$10M', '$10M-$50M', '$50M-$100M', '$100M+']
  },
  // Location
  location: {
    address: String,
    city: String,
    state: String,
    country: { type: String, required: true },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  // Contact
  contactInfo: {
    phone: String,
    email: String,
    website: String,
    whatsapp: String
  },
  // Categories & Products
  mainCategories: [String],
  mainProducts: [String],
  // Verification & Trust
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'gold', 'premium'],
      default: 'unverified'
    },
    verifiedAt: Date,
    verifiedBy: mongoose.Schema.Types.ObjectId,
    documents: [{
      type: String,
      url: String,
      uploadedAt: Date,
      verified: Boolean
    }]
  },
  // Certifications
  certifications: [{
    name: String,
    issuer: String,
    validFrom: Date,
    validTo: Date,
    documentUrl: String
  }],
  // Capabilities
  capabilities: {
    odm: { type: Boolean, default: false },
    oem: { type: Boolean, default: false },
    customPackaging: { type: Boolean, default: false },
    sampleAvailable: { type: Boolean, default: true },
    qualityControl: [String],
    exportMarkets: [String]
  },
  // Performance Metrics
  metrics: {
    responseRate: { type: Number, default: 0 },
    responseTime: { type: String, default: '< 24h' },
    onTimeDelivery: { type: Number, default: 0 },
    repeatBuyerRate: { type: Number, default: 0 }
  },
  // Ratings
  rating: {
    overall: { type: Number, default: 0, min: 0, max: 5 },
    productQuality: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 }
  },
  // Statistics
  stats: {
    totalProducts: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    activeRFQs: { type: Number, default: 0 }
  },
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
supplierSchema.index({ companyName: 'text', description: 'text', mainProducts: 'text' });
supplierSchema.index({ 'location.country': 1 });
supplierSchema.index({ mainCategories: 1 });
supplierSchema.index({ 'verification.status': 1 });
supplierSchema.index({ 'rating.overall': -1 });

// Generate slug before saving
supplierSchema.pre('save', function(next) {
  if (this.isModified('companyName')) {
    this.slug = this.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// Calculate profile completeness
supplierSchema.methods.calculateCompleteness = function() {
  let score = 0;
  const fields = [
    { field: 'companyName', weight: 10 },
    { field: 'description', weight: 10 },
    { field: 'logo', weight: 5 },
    { field: 'businessType', weight: 5 },
    { field: 'location.country', weight: 10 },
    { field: 'contactInfo.phone', weight: 5 },
    { field: 'contactInfo.email', weight: 5 },
    { field: 'mainCategories', weight: 10, isArray: true },
    { field: 'mainProducts', weight: 10, isArray: true },
    { field: 'verification.status', weight: 20, check: (v) => v !== 'unverified' },
    { field: 'certifications', weight: 10, isArray: true }
  ];

  fields.forEach(({ field, weight, isArray, check }) => {
    const value = field.split('.').reduce((obj, key) => obj?.[key], this);
    if (isArray) {
      if (value && value.length > 0) score += weight;
    } else if (check) {
      if (check(value)) score += weight;
    } else if (value) {
      score += weight;
    }
  });

  this.profileCompleteness = score;
  return score;
};

// Virtual populate products
supplierSchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'supplierId'
});

module.exports = mongoose.model('Supplier', supplierSchema);

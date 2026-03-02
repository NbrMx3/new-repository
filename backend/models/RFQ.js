const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  leadTime: {
    type: String,
    required: true
  },
  validUntil: {
    type: Date,
    required: true
  },
  notes: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'expired'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

const rfqSchema = new mongoose.Schema({
  rfqNumber: {
    type: String,
    unique: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Product Info
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: [true, 'Product name is required']
  },
  productDescription: String,
  productImage: String,
  // Supplier (optional - for direct RFQ)
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier'
  },
  // Quantity & Pricing
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1']
  },
  unit: {
    type: String,
    default: 'piece'
  },
  targetPrice: {
    type: Number
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'CNY', 'JPY']
  },
  // Delivery Requirements
  deliveryAddress: {
    country: { type: String, required: true },
    city: String,
    address: String,
    zipCode: String
  },
  preferredDeliveryDate: Date,
  shippingTerms: {
    type: String,
    enum: ['FOB', 'CIF', 'EXW', 'DDP', 'DAP'],
    default: 'FOB'
  },
  // Additional Requirements
  requirements: {
    type: String,
    maxlength: [2000, 'Requirements cannot exceed 2000 characters']
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: Date
  }],
  // Quotes from suppliers
  quotes: [quoteSchema],
  // Status
  status: {
    type: String,
    enum: ['draft', 'open', 'quoted', 'negotiating', 'accepted', 'closed', 'cancelled', 'expired'],
    default: 'open'
  },
  acceptedQuote: {
    type: mongoose.Schema.Types.ObjectId
  },
  // Expiration
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  // Communication
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
rfqSchema.index({ buyerId: 1, status: 1 });
rfqSchema.index({ supplierId: 1, status: 1 });
rfqSchema.index({ rfqNumber: 1 });
rfqSchema.index({ createdAt: -1 });
rfqSchema.index({ expiresAt: 1 });

// Generate RFQ number before saving
rfqSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.rfqNumber = `RFQ-${year}${month}-${(count + 1).toString().padStart(5, '0')}`;
  }
  next();
});

// Virtual for quote count
rfqSchema.virtual('quoteCount').get(function() {
  return this.quotes?.length || 0;
});

// Virtual for best quote
rfqSchema.virtual('bestQuote').get(function() {
  if (!this.quotes || this.quotes.length === 0) return null;
  return this.quotes.reduce((best, quote) => {
    if (quote.status !== 'pending') return best;
    if (!best || quote.unitPrice < best.unitPrice) return quote;
    return best;
  }, null);
});

// Check if RFQ is expired
rfqSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Update status based on quotes
rfqSchema.methods.updateStatusFromQuotes = function() {
  const pendingQuotes = this.quotes.filter(q => q.status === 'pending');
  const acceptedQuote = this.quotes.find(q => q.status === 'accepted');
  
  if (acceptedQuote) {
    this.status = 'accepted';
    this.acceptedQuote = acceptedQuote._id;
  } else if (pendingQuotes.length > 0) {
    this.status = 'quoted';
  }
};

module.exports = mongoose.model('RFQ', rfqSchema);

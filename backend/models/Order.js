const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  image: String,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: String,
  unitPrice: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  // Related RFQ (if order originated from RFQ)
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ'
  },
  // Order Items
  items: [orderItemSchema],
  // Pricing
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  // Shipping
  shippingAddress: {
    name: String,
    company: String,
    phone: String,
    email: String,
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'freight', 'pickup'],
    default: 'standard'
  },
  shippingTerms: {
    type: String,
    enum: ['FOB', 'CIF', 'EXW', 'DDP', 'DAP'],
    default: 'FOB'
  },
  trackingNumber: String,
  trackingUrl: String,
  estimatedDelivery: Date,
  // Payment
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'letter_of_credit', 'paypal', 'escrow', 'credit_terms'],
    default: 'bank_transfer'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentTerms: String,
  paidAmount: {
    type: Number,
    default: 0
  },
  // Status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'completed',
      'cancelled',
      'refunded'
    ],
    default: 'pending'
  },
  // Timeline
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: mongoose.Schema.Types.ObjectId
  }],
  // Notes
  buyerNotes: String,
  supplierNotes: String,
  internalNotes: String,
  // Dates
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  completedAt: Date,
  cancelledAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
orderSchema.index({ buyerId: 1, status: 1 });
orderSchema.index({ supplierId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    this.orderNumber = `ORD-${year}${month}-${(count + 1).toString().padStart(6, '0')}`;
    
    // Add initial timeline entry
    this.timeline = [{
      status: 'pending',
      timestamp: new Date(),
      note: 'Order created'
    }];
  }
  next();
});

// Add timeline entry method
orderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    timestamp: new Date(),
    note,
    updatedBy
  });
  this.status = status;
  
  // Update date fields
  const now = new Date();
  switch (status) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'shipped':
      this.shippedAt = now;
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
    case 'completed':
      this.completedAt = now;
      break;
    case 'cancelled':
      this.cancelledAt = now;
      break;
  }
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.totalAmount = this.subtotal + this.shippingCost + this.tax - this.discount;
};

module.exports = mongoose.model('Order', orderSchema);

// RFQ (Request for Quotation) Service
// Mock service for B2B quote requests

let mockRFQs = [
  {
    id: 'RFQ-001',
    buyerId: '1',
    buyerName: 'John Buyer',
    buyerCompany: 'Retail Corp',
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    productId: 1,
    productName: 'Wireless Bluetooth Headphones',
    quantity: 500,
    unit: 'pieces',
    targetPrice: 18.00,
    currency: 'USD',
    requirements: 'Need custom packaging with our brand logo. Prefer matte black color.',
    deliveryLocation: 'Los Angeles, CA, USA',
    deliveryDate: '2026-03-15',
    status: 'pending', // pending, quoted, accepted, rejected, expired
    createdAt: '2026-01-20T10:30:00Z',
    expiresAt: '2026-02-20T10:30:00Z',
    quotes: [],
    attachments: []
  },
  {
    id: 'RFQ-002',
    buyerId: '1',
    buyerName: 'John Buyer',
    buyerCompany: 'Retail Corp',
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    productId: 4,
    productName: 'Portable Power Bank',
    quantity: 1000,
    unit: 'pieces',
    targetPrice: 12.00,
    currency: 'USD',
    requirements: 'Need 20000mAh capacity with fast charging support. Custom color options needed.',
    deliveryLocation: 'New York, NY, USA',
    deliveryDate: '2026-04-01',
    status: 'quoted',
    createdAt: '2026-01-15T14:20:00Z',
    expiresAt: '2026-02-15T14:20:00Z',
    quotes: [
      {
        id: 'QUOTE-001',
        supplierId: 'supplier-1',
        unitPrice: 13.50,
        totalPrice: 13500,
        moq: 500,
        leadTime: '25 days',
        validUntil: '2026-02-10',
        notes: 'We can offer custom colors with MOQ of 500. Fast charging up to 65W supported.',
        createdAt: '2026-01-17T09:00:00Z'
      }
    ],
    attachments: []
  },
  {
    id: 'RFQ-003',
    buyerId: '4',
    buyerName: 'Mike Wholesale',
    buyerCompany: 'Wholesale Distributors',
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    productId: 2,
    productName: 'USB-C Cable 2m',
    quantity: 5000,
    unit: 'pieces',
    targetPrice: 3.50,
    currency: 'USD',
    requirements: 'Need durable braided cables. Must support 100W PD charging.',
    deliveryLocation: 'Chicago, IL, USA',
    deliveryDate: '2026-02-28',
    status: 'accepted',
    createdAt: '2026-01-10T08:45:00Z',
    expiresAt: '2026-02-10T08:45:00Z',
    quotes: [
      {
        id: 'QUOTE-002',
        supplierId: 'supplier-1',
        unitPrice: 4.00,
        totalPrice: 20000,
        moq: 1000,
        leadTime: '20 days',
        validUntil: '2026-02-05',
        notes: 'Braided nylon cables with 100W PD support. We can do custom lengths if needed.',
        createdAt: '2026-01-12T11:30:00Z',
        acceptedAt: '2026-01-14T16:00:00Z'
      }
    ],
    attachments: []
  }
];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const rfqService = {
  // Create a new RFQ
  async createRFQ(rfqData) {
    await delay(500);
    
    const newRFQ = {
      id: `RFQ-${String(mockRFQs.length + 1).padStart(3, '0')}`,
      ...rfqData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      quotes: [],
      attachments: []
    };
    
    mockRFQs.push(newRFQ);
    return newRFQ;
  },

  // Get RFQs for a buyer
  async getBuyerRFQs(buyerId) {
    await delay(300);
    return mockRFQs.filter(rfq => rfq.buyerId === buyerId);
  },

  // Get RFQs for a supplier
  async getSupplierRFQs(supplierId) {
    await delay(300);
    return mockRFQs.filter(rfq => rfq.supplierId === supplierId);
  },

  // Get single RFQ by ID
  async getRFQById(rfqId) {
    await delay(200);
    return mockRFQs.find(rfq => rfq.id === rfqId) || null;
  },

  // Submit a quote (supplier action)
  async submitQuote(rfqId, quoteData) {
    await delay(500);
    
    const rfqIndex = mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');
    
    const newQuote = {
      id: `QUOTE-${String(Date.now()).slice(-6)}`,
      ...quoteData,
      createdAt: new Date().toISOString()
    };
    
    mockRFQs[rfqIndex].quotes.push(newQuote);
    mockRFQs[rfqIndex].status = 'quoted';
    
    return newQuote;
  },

  // Accept a quote (buyer action)
  async acceptQuote(rfqId, quoteId) {
    await delay(500);
    
    const rfqIndex = mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');
    
    const quoteIndex = mockRFQs[rfqIndex].quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) throw new Error('Quote not found');
    
    mockRFQs[rfqIndex].quotes[quoteIndex].acceptedAt = new Date().toISOString();
    mockRFQs[rfqIndex].status = 'accepted';
    
    return mockRFQs[rfqIndex];
  },

  // Reject a quote (buyer action)
  async rejectQuote(rfqId, quoteId, reason) {
    await delay(500);
    
    const rfqIndex = mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');
    
    const quoteIndex = mockRFQs[rfqIndex].quotes.findIndex(q => q.id === quoteId);
    if (quoteIndex === -1) throw new Error('Quote not found');
    
    mockRFQs[rfqIndex].quotes[quoteIndex].rejectedAt = new Date().toISOString();
    mockRFQs[rfqIndex].quotes[quoteIndex].rejectionReason = reason;
    
    return mockRFQs[rfqIndex];
  },

  // Cancel an RFQ (buyer action)
  async cancelRFQ(rfqId) {
    await delay(300);
    
    const rfqIndex = mockRFQs.findIndex(rfq => rfq.id === rfqId);
    if (rfqIndex === -1) throw new Error('RFQ not found');
    
    mockRFQs[rfqIndex].status = 'cancelled';
    mockRFQs[rfqIndex].cancelledAt = new Date().toISOString();
    
    return mockRFQs[rfqIndex];
  },

  // Get RFQ statistics
  async getRFQStats(userId, role) {
    await delay(200);
    
    const userRFQs = role === 'supplier' 
      ? mockRFQs.filter(rfq => rfq.supplierId === userId)
      : mockRFQs.filter(rfq => rfq.buyerId === userId);
    
    return {
      total: userRFQs.length,
      pending: userRFQs.filter(r => r.status === 'pending').length,
      quoted: userRFQs.filter(r => r.status === 'quoted').length,
      accepted: userRFQs.filter(r => r.status === 'accepted').length,
      rejected: userRFQs.filter(r => r.status === 'rejected').length,
      expired: userRFQs.filter(r => r.status === 'expired').length
    };
  }
};

export default rfqService;

// Mock supplier data and service
// In production, this would connect to a real backend API

const mockSuppliers = [
  {
    id: 'supplier-1',
    userId: '2',
    companyName: 'TechPro Manufacturing Ltd',
    logo: 'https://via.placeholder.com/120x120?text=TechPro',
    coverImage: 'https://via.placeholder.com/1200x300?text=TechPro+Banner',
    description: 'Leading manufacturer of consumer electronics and accessories with over 15 years of experience in the industry.',
    shortDescription: 'Premium electronics manufacturer',
    establishedYear: 2008,
    employeeCount: '500-1000',
    annualRevenue: '$10M - $50M',
    location: {
      country: 'China',
      city: 'Shenzhen',
      address: '123 Industrial Zone, Nanshan District'
    },
    contact: {
      email: 'sales@techpro.com',
      phone: '+86-755-1234567',
      website: 'www.techpro.com'
    },
    verified: true,
    verificationLevel: 'gold',
    certifications: ['ISO 9001', 'CE', 'RoHS', 'FCC'],
    productCategories: ['Electronics', 'Computer Accessories', 'Phone Accessories'],
    mainProducts: ['Wireless Headphones', 'Power Banks', 'USB Cables', 'Chargers'],
    moqRange: '100 - 10000 units',
    responseTime: '< 24 hours',
    onTimeDelivery: 98,
    qualityScore: 4.8,
    totalTransactions: 1250,
    repeatBuyerRate: 85,
    memberSince: '2020-03-15',
    stats: {
      totalProducts: 45,
      totalOrders: 1250,
      totalBuyers: 320,
      avgRating: 4.8
    }
  },
  {
    id: 'supplier-2',
    userId: '3',
    companyName: 'Global Gadgets Inc',
    logo: 'https://via.placeholder.com/120x120?text=GG',
    coverImage: 'https://via.placeholder.com/1200x300?text=Global+Gadgets',
    description: 'Innovative gadget solutions for the modern world. We specialize in smart home devices and IoT products.',
    shortDescription: 'Smart home & IoT specialists',
    establishedYear: 2015,
    employeeCount: '100-500',
    annualRevenue: '$5M - $10M',
    location: {
      country: 'Taiwan',
      city: 'Taipei',
      address: '456 Tech Park, Xinyi District'
    },
    contact: {
      email: 'info@globalgadgets.com',
      phone: '+886-2-9876543',
      website: 'www.globalgadgets.com'
    },
    verified: true,
    verificationLevel: 'silver',
    certifications: ['ISO 9001', 'CE'],
    productCategories: ['Electronics', 'Lighting', 'Smart Home'],
    mainProducts: ['LED Lamps', 'Smart Plugs', 'Webcams', 'Speakers'],
    moqRange: '50 - 5000 units',
    responseTime: '< 48 hours',
    onTimeDelivery: 95,
    qualityScore: 4.6,
    totalTransactions: 680,
    repeatBuyerRate: 78,
    memberSince: '2021-06-20',
    stats: {
      totalProducts: 28,
      totalOrders: 680,
      totalBuyers: 180,
      avgRating: 4.6
    }
  }
];

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const supplierService = {
  // Get supplier profile by user ID
  async getSupplierByUserId(userId) {
    await delay(300);
    return mockSuppliers.find(s => s.userId === userId) || null;
  },

  // Get supplier profile by supplier ID
  async getSupplierById(supplierId) {
    await delay(300);
    return mockSuppliers.find(s => s.id === supplierId) || null;
  },

  // Get all suppliers
  async getAllSuppliers() {
    await delay(300);
    return mockSuppliers;
  },

  // Search suppliers
  async searchSuppliers(query) {
    await delay(300);
    const q = query.toLowerCase();
    return mockSuppliers.filter(s => 
      s.companyName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.productCategories.some(c => c.toLowerCase().includes(q)) ||
      s.mainProducts.some(p => p.toLowerCase().includes(q))
    );
  },

  // Update supplier profile
  async updateSupplierProfile(supplierId, updates) {
    await delay(500);
    const index = mockSuppliers.findIndex(s => s.id === supplierId);
    if (index === -1) throw new Error('Supplier not found');
    
    mockSuppliers[index] = { ...mockSuppliers[index], ...updates };
    return mockSuppliers[index];
  },

  // Create supplier profile
  async createSupplierProfile(userId, profileData) {
    await delay(500);
    const newSupplier = {
      id: `supplier-${Date.now()}`,
      userId,
      ...profileData,
      verified: false,
      verificationLevel: 'none',
      memberSince: new Date().toISOString(),
      stats: {
        totalProducts: 0,
        totalOrders: 0,
        totalBuyers: 0,
        avgRating: 0
      }
    };
    mockSuppliers.push(newSupplier);
    return newSupplier;
  },

  // Get supplier statistics
  async getSupplierStats(supplierId) {
    await delay(200);
    const supplier = mockSuppliers.find(s => s.id === supplierId);
    if (!supplier) throw new Error('Supplier not found');
    
    return {
      ...supplier.stats,
      recentOrders: [
        { id: 'ORD-001', date: '2026-01-24', amount: 2500, status: 'shipped' },
        { id: 'ORD-002', date: '2026-01-23', amount: 1800, status: 'processing' },
        { id: 'ORD-003', date: '2026-01-22', amount: 3200, status: 'delivered' },
      ],
      monthlyRevenue: [
        { month: 'Aug', revenue: 45000 },
        { month: 'Sep', revenue: 52000 },
        { month: 'Oct', revenue: 48000 },
        { month: 'Nov', revenue: 61000 },
        { month: 'Dec', revenue: 78000 },
        { month: 'Jan', revenue: 65000 },
      ],
      topProducts: [
        { name: 'Wireless Headphones', sales: 450, revenue: 13500 },
        { name: 'Power Bank 20000mAh', sales: 380, revenue: 7600 },
        { name: 'USB-C Cable', sales: 620, revenue: 5580 },
      ]
    };
  },

  // Request verification
  async requestVerification(supplierId, documents) {
    await delay(800);
    return { 
      success: true, 
      message: 'Verification request submitted. You will be notified within 3-5 business days.',
      ticketId: `VER-${Date.now()}`
    };
  }
};

export default supplierService;

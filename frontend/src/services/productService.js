// Enhanced B2B Product data with MOQ, bulk pricing, and supplier info
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    price: 29.99,
    originalPrice: 59.99,
    image: 'https://placehold.co/300x300?text=Headphones',
    category: 'Electronics',
    rating: 4.5,
    reviews: 1250,
    description: 'High-quality wireless headphones with noise cancellation',
    inStock: true,
    // B2B Enhanced Fields
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 100,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 100, maxQty: 499, price: 25.99 },
      { minQty: 500, maxQty: 999, price: 22.99 },
      { minQty: 1000, maxQty: null, price: 18.99 }
    ],
    leadTime: '15-20 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 35.00,
    specifications: {
      'Battery Life': '40 hours',
      'Bluetooth': '5.2',
      'Driver Size': '40mm',
      'Weight': '250g',
      'Noise Cancellation': 'Active ANC'
    },
    packagingDetails: {
      unitWeight: '0.3 kg',
      packageSize: '20x15x8 cm',
      unitsPerCarton: 50,
      cartonSize: '60x40x45 cm'
    }
  },
  {
    id: 2,
    name: 'USB-C Cable 2m',
    price: 8.99,
    originalPrice: 15.99,
    image: 'https://placehold.co/300x300?text=USB+Cable',
    category: 'Cables & Adapters',
    rating: 4.8,
    reviews: 2100,
    description: 'Fast charging USB-C cable compatible with all devices',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 500,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 500, maxQty: 1999, price: 6.99 },
      { minQty: 2000, maxQty: 4999, price: 5.49 },
      { minQty: 5000, maxQty: null, price: 3.99 }
    ],
    leadTime: '10-15 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 12.00,
    specifications: {
      'Length': '2 meters',
      'Power Delivery': '100W',
      'Data Transfer': '480Mbps',
      'Material': 'Braided Nylon'
    },
    packagingDetails: {
      unitWeight: '0.05 kg',
      packageSize: '15x8x2 cm',
      unitsPerCarton: 200,
      cartonSize: '40x30x30 cm'
    }
  },
  {
    id: 3,
    name: 'Phone Screen Protector',
    price: 5.99,
    originalPrice: 12.99,
    image: 'https://placehold.co/300x300?text=Screen+Protector',
    category: 'Phone Accessories',
    rating: 4.6,
    reviews: 890,
    description: 'Tempered glass screen protector for smartphones',
    inStock: true,
    supplierId: 'supplier-2',
    supplierName: 'Global Gadgets Inc',
    supplierVerified: true,
    moq: 200,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 200, maxQty: 999, price: 4.49 },
      { minQty: 1000, maxQty: 4999, price: 2.99 },
      { minQty: 5000, maxQty: null, price: 1.99 }
    ],
    leadTime: '7-12 days',
    customization: false,
    sampleAvailable: true,
    samplePrice: 8.00,
    specifications: {
      'Hardness': '9H',
      'Thickness': '0.33mm',
      'Transparency': '99.9%',
      'Oleophobic Coating': 'Yes'
    },
    packagingDetails: {
      unitWeight: '0.02 kg',
      packageSize: '18x10x1 cm',
      unitsPerCarton: 500,
      cartonSize: '45x35x25 cm'
    }
  },
  {
    id: 4,
    name: 'Portable Power Bank',
    price: 19.99,
    originalPrice: 39.99,
    image: 'https://placehold.co/300x300?text=Power+Bank',
    category: 'Electronics',
    rating: 4.7,
    reviews: 3400,
    description: '20000mAh portable power bank with fast charging',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 50,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 50, maxQty: 199, price: 17.99 },
      { minQty: 200, maxQty: 499, price: 14.99 },
      { minQty: 500, maxQty: null, price: 11.99 }
    ],
    leadTime: '15-20 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 25.00,
    specifications: {
      'Capacity': '20000mAh',
      'Input': 'USB-C 18W',
      'Output': 'USB-A 22.5W, USB-C 20W',
      'Weight': '350g'
    },
    packagingDetails: {
      unitWeight: '0.4 kg',
      packageSize: '15x8x3 cm',
      unitsPerCarton: 40,
      cartonSize: '50x40x30 cm'
    }
  },
  {
    id: 5,
    name: 'LED Desk Lamp',
    price: 24.99,
    originalPrice: 49.99,
    image: 'https://placehold.co/300x300?text=Desk+Lamp',
    category: 'Lighting',
    rating: 4.4,
    reviews: 567,
    description: 'Adjustable LED desk lamp with USB charging port',
    inStock: true,
    supplierId: 'supplier-2',
    supplierName: 'Global Gadgets Inc',
    supplierVerified: true,
    moq: 30,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 30, maxQty: 99, price: 21.99 },
      { minQty: 100, maxQty: 299, price: 18.99 },
      { minQty: 300, maxQty: null, price: 15.99 }
    ],
    leadTime: '12-18 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 30.00,
    specifications: {
      'Power': '10W LED',
      'Color Temperature': '3000K-6500K',
      'Brightness Levels': '5',
      'USB Port': 'Yes'
    },
    packagingDetails: {
      unitWeight: '0.8 kg',
      packageSize: '40x15x15 cm',
      unitsPerCarton: 12,
      cartonSize: '65x50x45 cm'
    }
  },
  {
    id: 6,
    name: 'Wireless Mouse',
    price: 12.99,
    originalPrice: 29.99,
    image: 'https://placehold.co/300x300?text=Wireless+Mouse',
    category: 'Computer Accessories',
    rating: 4.5,
    reviews: 1876,
    description: 'Ergonomic wireless mouse with precision tracking',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 100,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 100, maxQty: 499, price: 10.99 },
      { minQty: 500, maxQty: 999, price: 8.99 },
      { minQty: 1000, maxQty: null, price: 6.99 }
    ],
    leadTime: '10-15 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 15.00,
    specifications: {
      'DPI': '1600',
      'Buttons': '6',
      'Battery': '1x AA',
      'Connection': '2.4GHz Wireless'
    },
    packagingDetails: {
      unitWeight: '0.1 kg',
      packageSize: '15x10x5 cm',
      unitsPerCarton: 100,
      cartonSize: '55x45x35 cm'
    }
  },
  {
    id: 7,
    name: 'Phone Stand',
    price: 9.99,
    originalPrice: 19.99,
    image: 'https://placehold.co/300x300?text=Phone+Stand',
    category: 'Phone Accessories',
    rating: 4.3,
    reviews: 745,
    description: 'Adjustable phone stand for desk or travel',
    inStock: true,
    supplierId: 'supplier-2',
    supplierName: 'Global Gadgets Inc',
    supplierVerified: true,
    moq: 200,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 200, maxQty: 499, price: 7.99 },
      { minQty: 500, maxQty: 999, price: 5.99 },
      { minQty: 1000, maxQty: null, price: 3.99 }
    ],
    leadTime: '7-12 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 12.00,
    specifications: {
      'Material': 'Aluminum Alloy',
      'Adjustable Angle': '0-100°',
      'Max Phone Size': '12.9 inch',
      'Foldable': 'Yes'
    },
    packagingDetails: {
      unitWeight: '0.15 kg',
      packageSize: '12x8x3 cm',
      unitsPerCarton: 100,
      cartonSize: '45x35x30 cm'
    }
  },
  {
    id: 8,
    name: 'Webcam HD 1080p',
    price: 34.99,
    originalPrice: 69.99,
    image: 'https://placehold.co/300x300?text=Webcam',
    category: 'Electronics',
    rating: 4.6,
    reviews: 2234,
    description: 'Full HD 1080p webcam with auto focus',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 50,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 50, maxQty: 199, price: 29.99 },
      { minQty: 200, maxQty: 499, price: 24.99 },
      { minQty: 500, maxQty: null, price: 19.99 }
    ],
    leadTime: '15-20 days',
    customization: false,
    sampleAvailable: true,
    samplePrice: 40.00,
    specifications: {
      'Resolution': '1080p @ 30fps',
      'Microphone': 'Built-in Stereo',
      'Autofocus': 'Yes',
      'FOV': '90°'
    },
    packagingDetails: {
      unitWeight: '0.2 kg',
      packageSize: '12x8x8 cm',
      unitsPerCarton: 50,
      cartonSize: '50x40x35 cm'
    }
  },
  {
    id: 9,
    name: 'Keyboard Mechanical',
    price: 44.99,
    originalPrice: 89.99,
    image: 'https://placehold.co/300x300?text=Keyboard',
    category: 'Computer Accessories',
    rating: 4.7,
    reviews: 1650,
    description: 'Mechanical RGB keyboard with quiet switches',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 30,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 30, maxQty: 99, price: 39.99 },
      { minQty: 100, maxQty: 299, price: 34.99 },
      { minQty: 300, maxQty: null, price: 29.99 }
    ],
    leadTime: '18-25 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 55.00,
    specifications: {
      'Switch Type': 'Red Linear',
      'Keycaps': 'Double-shot PBT',
      'Backlight': 'RGB',
      'Layout': '104 Keys'
    },
    packagingDetails: {
      unitWeight: '1.1 kg',
      packageSize: '48x18x5 cm',
      unitsPerCarton: 10,
      cartonSize: '55x40x30 cm'
    }
  },
  {
    id: 10,
    name: 'Phone Charger 65W',
    price: 22.99,
    originalPrice: 45.99,
    image: 'https://placehold.co/300x300?text=Charger',
    category: 'Cables & Adapters',
    rating: 4.8,
    reviews: 3100,
    description: 'Fast 65W charger compatible with most devices',
    inStock: true,
    supplierId: 'supplier-1',
    supplierName: 'TechPro Manufacturing Ltd',
    supplierVerified: true,
    moq: 100,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 100, maxQty: 499, price: 18.99 },
      { minQty: 500, maxQty: 999, price: 15.99 },
      { minQty: 1000, maxQty: null, price: 12.99 }
    ],
    leadTime: '12-18 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 28.00,
    specifications: {
      'Power': '65W',
      'Ports': '2x USB-C, 1x USB-A',
      'Protocols': 'PD3.0, QC4.0',
      'Input': '100-240V'
    },
    packagingDetails: {
      unitWeight: '0.15 kg',
      packageSize: '8x6x4 cm',
      unitsPerCarton: 100,
      cartonSize: '45x35x25 cm'
    }
  },
  {
    id: 11,
    name: 'Tablet Screen Protector',
    price: 6.99,
    originalPrice: 14.99,
    image: 'https://placehold.co/300x300?text=Tablet+Protector',
    category: 'Tablet Accessories',
    rating: 4.4,
    reviews: 432,
    description: 'Premium tempered glass for tablets',
    inStock: true,
    supplierId: 'supplier-2',
    supplierName: 'Global Gadgets Inc',
    supplierVerified: true,
    moq: 100,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 100, maxQty: 499, price: 5.49 },
      { minQty: 500, maxQty: 999, price: 3.99 },
      { minQty: 1000, maxQty: null, price: 2.49 }
    ],
    leadTime: '7-12 days',
    customization: false,
    sampleAvailable: true,
    samplePrice: 10.00,
    specifications: {
      'Hardness': '9H',
      'Thickness': '0.33mm',
      'Size': '10-12.9 inch',
      'Anti-Fingerprint': 'Yes'
    },
    packagingDetails: {
      unitWeight: '0.05 kg',
      packageSize: '30x22x1 cm',
      unitsPerCarton: 200,
      cartonSize: '50x45x30 cm'
    }
  },
  {
    id: 12,
    name: 'Bluetooth Speaker',
    price: 39.99,
    originalPrice: 79.99,
    image: 'https://placehold.co/300x300?text=Speaker',
    category: 'Electronics',
    rating: 4.6,
    reviews: 2876,
    description: 'Waterproof portable Bluetooth speaker',
    inStock: true,
    supplierId: 'supplier-2',
    supplierName: 'Global Gadgets Inc',
    supplierVerified: true,
    moq: 50,
    unit: 'pieces',
    bulkPricing: [
      { minQty: 50, maxQty: 199, price: 34.99 },
      { minQty: 200, maxQty: 499, price: 29.99 },
      { minQty: 500, maxQty: null, price: 24.99 }
    ],
    leadTime: '15-20 days',
    customization: true,
    sampleAvailable: true,
    samplePrice: 45.00,
    specifications: {
      'Power': '20W',
      'Battery': '5000mAh',
      'Playtime': '12 hours',
      'Waterproof': 'IPX7'
    },
    packagingDetails: {
      unitWeight: '0.6 kg',
      packageSize: '18x10x10 cm',
      unitsPerCarton: 20,
      cartonSize: '55x45x40 cm'
    }
  }
];

export const productService = {
  getAllProducts: () => Promise.resolve(mockProducts),
  
  getProductById: (id) => {
    return Promise.resolve(mockProducts.find(p => p.id === id));
  },

  searchProducts: (query) => {
    const results = mockProducts.filter(p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(results);
  },

  getProductsByCategory: (category) => {
    const results = mockProducts.filter(p => p.category === category);
    return Promise.resolve(results);
  },

  getCategories: () => {
    const categories = [...new Set(mockProducts.map(p => p.category))];
    return Promise.resolve(categories);
  }
};

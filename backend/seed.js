const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('./models/User');
const Supplier = require('./models/Supplier');
const Product = require('./models/Product');
const RFQ = require('./models/RFQ');
const Conversation = require('./models/Conversation');

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/b2b_marketplace');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Clear existing data
const clearData = async () => {
  console.log('🗑️  Clearing existing data...');
  await User.deleteMany({});
  await Supplier.deleteMany({});
  await Product.deleteMany({});
  await RFQ.deleteMany({});
  await Conversation.deleteMany({});
  console.log('✅ Data cleared');
};

// Seed Users
const seedUsers = async () => {
  console.log('👤 Seeding users...');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@b2bmarket.com',
      password: 'Admin123!',
      role: 'admin',
      isEmailVerified: true,
      company: 'B2B Marketplace',
      phone: '+1-555-0100'
    },
    {
      name: 'John Buyer',
      email: 'buyer@example.com',
      password: 'Buyer123!',
      role: 'buyer',
      isEmailVerified: true,
      company: 'Retail Solutions Inc.',
      phone: '+1-555-0101',
      address: {
        street: '123 Commerce St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States'
      }
    },
    {
      name: 'Sarah Buyer',
      email: 'sarah@buyerco.com',
      password: 'Buyer123!',
      role: 'buyer',
      isEmailVerified: true,
      company: 'BuyerCo Ltd.',
      phone: '+1-555-0102'
    },
    {
      name: 'Mike Supplier',
      email: 'supplier1@example.com',
      password: 'Supplier123!',
      role: 'supplier',
      isEmailVerified: true,
      company: 'TechParts Manufacturing',
      phone: '+1-555-0201'
    },
    {
      name: 'Lisa Supplier',
      email: 'supplier2@example.com',
      password: 'Supplier123!',
      role: 'supplier',
      isEmailVerified: true,
      company: 'ElectroGoods Co.',
      phone: '+1-555-0202'
    },
    {
      name: 'David Supplier',
      email: 'supplier3@example.com',
      password: 'Supplier123!',
      role: 'supplier',
      isEmailVerified: true,
      company: 'Industrial Supply Chain',
      phone: '+1-555-0203'
    }
  ];

  const createdUsers = await User.create(users);
  console.log(`✅ Created ${createdUsers.length} users`);
  return createdUsers;
};

// Seed Suppliers
const seedSuppliers = async (users) => {
  console.log('🏭 Seeding suppliers...');
  
  const supplierUsers = users.filter(u => u.role === 'supplier');
  
  const suppliers = [
    {
      userId: supplierUsers[0]._id,
      companyName: 'TechParts Manufacturing',
      businessType: 'manufacturer',
      description: 'Leading manufacturer of electronic components and tech accessories. We specialize in high-quality parts for smartphones, laptops, and IoT devices.',
      yearEstablished: 2010,
      employeeCount: '51-200',
      annualRevenue: '$10M-$50M',
      location: {
        address: '456 Industrial Ave',
        city: 'Shenzhen',
        state: 'Guangdong',
        country: 'China',
        zipCode: '518000'
      },
      contactInfo: {
        email: 'sales@techparts.com',
        phone: '+86-755-12345678',
        website: 'https://techparts.example.com'
      },
      mainCategories: ['Electronics', 'Components', 'Accessories'],
      mainProducts: ['USB Cables', 'Earbuds', 'LED Displays'],
      verification: {
        status: 'verified',
        verifiedAt: new Date()
      },
      certifications: [
        { name: 'ISO 9001:2015', issuer: 'ISO', validUntil: new Date('2025-12-31'), verified: true },
        { name: 'CE Certification', issuer: 'EU', validUntil: new Date('2025-12-31'), verified: true }
      ],
      stats: {
        rating: 4.8,
        reviewCount: 156,
        responseRate: 98,
        responseTime: 2,
        orderCount: 1250
      }
    },
    {
      userId: supplierUsers[1]._id,
      companyName: 'ElectroGoods Co.',
      businessType: 'trading',
      description: 'Premium wholesale supplier of consumer electronics, gaming accessories, and smart home devices. Fast shipping worldwide.',
      yearEstablished: 2015,
      employeeCount: '11-50',
      annualRevenue: '$1M-$10M',
      location: {
        address: '789 Trade Center',
        city: 'Hong Kong',
        state: 'Hong Kong',
        country: 'Hong Kong',
        zipCode: '999077'
      },
      contactInfo: {
        email: 'info@electrogoods.com',
        phone: '+852-2345-6789',
        website: 'https://electrogoods.example.com'
      },
      mainCategories: ['Consumer Electronics', 'Gaming', 'Smart Home'],
      mainProducts: ['Gaming Keyboards', 'Power Strips', 'SSDs'],
      verification: {
        status: 'verified',
        verifiedAt: new Date()
      },
      stats: {
        rating: 4.5,
        reviewCount: 89,
        responseRate: 95,
        responseTime: 4,
        orderCount: 680
      }
    },
    {
      userId: supplierUsers[2]._id,
      companyName: 'Industrial Supply Chain',
      businessType: 'distributor',
      description: 'Full-service industrial supply distributor. From raw materials to finished goods, we connect manufacturers with quality suppliers.',
      yearEstablished: 2005,
      employeeCount: '201-500',
      annualRevenue: '$50M-$100M',
      location: {
        address: '100 Logistics Blvd',
        city: 'Chicago',
        state: 'IL',
        country: 'United States',
        zipCode: '60601'
      },
      contactInfo: {
        email: 'sales@industrialsupply.com',
        phone: '+1-312-555-0199',
        website: 'https://industrialsupply.example.com'
      },
      mainCategories: ['Industrial Equipment', 'Raw Materials', 'Machinery'],
      mainProducts: ['Conveyor Belts', 'Hydraulic Presses', 'Steel Sheets'],
      verification: {
        status: 'gold',
        verifiedAt: new Date()
      },
      certifications: [
        { name: 'ISO 14001', issuer: 'ISO', validUntil: new Date('2025-12-31'), verified: true }
      ],
      stats: {
        rating: 4.6,
        reviewCount: 234,
        responseRate: 92,
        responseTime: 6,
        orderCount: 3200
      }
    }
  ];

  const createdSuppliers = await Supplier.create(suppliers);
  console.log(`✅ Created ${createdSuppliers.length} suppliers`);
  return createdSuppliers;
};

// Seed Products
const seedProducts = async (suppliers) => {
  console.log('📦 Seeding products...');
  
  const products = [
    // TechParts Manufacturing Products
    {
      name: 'Premium USB-C Cable 1m',
      description: 'High-speed USB-C to USB-C cable with 100W power delivery and 10Gbps data transfer. Braided nylon for durability.',
      category: 'Electronics',
      subcategory: 'Cables & Connectors',
      supplierId: suppliers[0]._id,
      price: 4.50,
      moq: 100,
      unit: 'piece',
      bulkPricing: [
        { minQty: 100, maxQty: 499, price: 4.50 },
        { minQty: 500, maxQty: 999, price: 4.00 },
        { minQty: 1000, price: 3.50 }
      ],
      stock: 50000,
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Length', '1 meter'],
        ['Material', 'Braided Nylon'],
        ['Power Delivery', '100W'],
        ['Data Speed', '10Gbps'],
        ['Color', 'Black']
      ]),
      tags: ['USB-C', 'fast charging', 'data cable', 'durable'],
      leadTime: '5-10 days',
      status: 'active',
      featured: true
    },
    {
      name: 'Wireless Bluetooth Earbuds Pro',
      description: 'True wireless earbuds with active noise cancellation, 30-hour battery life, and IPX5 water resistance. Premium audio quality.',
      category: 'Electronics',
      subcategory: 'Audio',
      supplierId: suppliers[0]._id,
      price: 12.00,
      moq: 50,
      unit: 'piece',
      bulkPricing: [
        { minQty: 50, maxQty: 199, price: 12.00 },
        { minQty: 200, maxQty: 499, price: 10.50 },
        { minQty: 500, price: 9.00 }
      ],
      stock: 15000,
      images: [
        { url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Bluetooth', '5.2'],
        ['Battery Life', '30 hours'],
        ['Water Resistance', 'IPX5'],
        ['Noise Cancellation', 'Active'],
        ['Charging', 'USB-C']
      ]),
      tags: ['wireless', 'bluetooth', 'earbuds', 'ANC', 'waterproof'],
      leadTime: '7-15 days',
      status: 'active',
      featured: true
    },
    {
      name: 'LED Display Module 7-inch',
      description: 'High-resolution 7-inch LED display module for embedded systems and IoT projects. 1024x600 resolution with capacitive touch.',
      category: 'Components',
      subcategory: 'Displays',
      supplierId: suppliers[0]._id,
      price: 28.00,
      moq: 20,
      unit: 'piece',
      bulkPricing: [
        { minQty: 20, maxQty: 99, price: 28.00 },
        { minQty: 100, maxQty: 499, price: 24.00 },
        { minQty: 500, price: 20.00 }
      ],
      stock: 5000,
      images: [
        { url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Resolution', '1024x600'],
        ['Touchscreen', 'Capacitive'],
        ['Interface', 'HDMI/GPIO'],
        ['Power', '5W']
      ]),
      tags: ['display', 'LED', 'touchscreen', 'IoT', 'embedded'],
      leadTime: '10-20 days',
      status: 'active'
    },

    // ElectroGoods Co. Products
    {
      name: 'Gaming Mechanical Keyboard RGB',
      description: 'Full-size mechanical gaming keyboard with customizable RGB backlighting, hot-swappable switches, and programmable macros.',
      category: 'Gaming',
      subcategory: 'Peripherals',
      supplierId: suppliers[1]._id,
      price: 18.00,
      moq: 30,
      unit: 'piece',
      bulkPricing: [
        { minQty: 30, maxQty: 99, price: 18.00 },
        { minQty: 100, maxQty: 299, price: 15.50 },
        { minQty: 300, price: 13.00 }
      ],
      stock: 8000,
      images: [
        { url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Switch Type', 'Blue Mechanical'],
        ['Lighting', 'RGB 16.8M colors'],
        ['Keycaps', 'Double-shot PBT'],
        ['Connectivity', 'USB-C Wired']
      ]),
      tags: ['gaming', 'keyboard', 'mechanical', 'RGB', 'esports'],
      leadTime: '5-12 days',
      status: 'active',
      featured: true
    },
    {
      name: 'Smart WiFi Power Strip',
      description: 'Smart power strip with 4 outlets and 4 USB ports. Voice control compatible with Alexa and Google Home. Energy monitoring.',
      category: 'Smart Home',
      subcategory: 'Power Management',
      supplierId: suppliers[1]._id,
      price: 8.50,
      moq: 50,
      unit: 'piece',
      bulkPricing: [
        { minQty: 50, maxQty: 199, price: 8.50 },
        { minQty: 200, maxQty: 499, price: 7.25 },
        { minQty: 500, price: 6.00 }
      ],
      stock: 20000,
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Outlets', '4 AC + 4 USB'],
        ['WiFi', '2.4GHz'],
        ['Voice Control', 'Alexa, Google Home'],
        ['Max Power', '1875W']
      ]),
      tags: ['smart home', 'power strip', 'wifi', 'voice control'],
      leadTime: '7-14 days',
      status: 'active'
    },
    {
      name: 'Portable SSD 1TB External',
      description: 'Ultra-fast portable SSD with USB 3.2 Gen 2 interface. 1050MB/s read speed. Compact aluminum design with shock resistance.',
      category: 'Consumer Electronics',
      subcategory: 'Storage',
      supplierId: suppliers[1]._id,
      price: 42.00,
      price: 42.00,
      moq: 25,
      unit: 'piece',
      bulkPricing: [
        { minQty: 25, maxQty: 99, price: 42.00 },
        { minQty: 100, maxQty: 249, price: 38.00 },
        { minQty: 250, price: 35.00 }
      ],
      stock: 3000,
      images: [
        { url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Capacity', '1TB'],
        ['Read Speed', '1050 MB/s'],
        ['Write Speed', '1000 MB/s'],
        ['Interface', 'USB 3.2 Gen 2'],
        ['Material', 'Aluminum']
      ]),
      tags: ['SSD', 'portable', 'storage', 'fast', 'backup'],
      leadTime: '5-10 days',
      status: 'active'
    },

    // Industrial Supply Chain Products
    {
      name: 'Industrial Conveyor Belt 10m',
      description: 'Heavy-duty PVC conveyor belt suitable for manufacturing and logistics. High tensile strength and wear resistance.',
      category: 'Industrial Equipment',
      subcategory: 'Material Handling',
      supplierId: suppliers[2]._id,
      price: 350.00,
      moq: 5,
      unit: 'piece',
      bulkPricing: [
        { minQty: 5, maxQty: 19, price: 350.00 },
        { minQty: 20, maxQty: 49, price: 315.00 },
        { minQty: 50, price: 280.00 }
      ],
      stock: 500,
      images: [
        { url: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Length', '10 meters'],
        ['Width', '500mm'],
        ['Material', 'PVC'],
        ['Thickness', '5mm'],
        ['Tensile Strength', '400 N/mm']
      ]),
      tags: ['conveyor', 'industrial', 'manufacturing', 'logistics'],
      leadTime: '14-21 days',
      status: 'active'
    },
    {
      name: 'Hydraulic Press 50-Ton',
      description: 'Heavy-duty hydraulic press machine for metal forming, stamping, and assembly operations. Precision control system.',
      category: 'Machinery',
      subcategory: 'Presses',
      supplierId: suppliers[2]._id,
      price: 8500.00,
      moq: 1,
      unit: 'piece',
      bulkPricing: [
        { minQty: 1, maxQty: 2, price: 8500.00 },
        { minQty: 3, maxQty: 5, price: 8000.00 },
        { minQty: 6, price: 7500.00 }
      ],
      stock: 25,
      images: [
        { url: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Capacity', '50 tons'],
        ['Table Size', '600x800mm'],
        ['Stroke', '300mm'],
        ['Motor Power', '7.5kW'],
        ['Control', 'PLC Digital']
      ]),
      tags: ['hydraulic', 'press', 'metal working', 'manufacturing'],
      leadTime: '30-45 days',
      status: 'active',
      featured: true
    },
    {
      name: 'Stainless Steel Sheet 304 2mm',
      description: 'Premium grade 304 stainless steel sheet. Corrosion resistant, suitable for food processing and industrial applications.',
      category: 'Raw Materials',
      subcategory: 'Metals',
      supplierId: suppliers[2]._id,
      price: 85.00,
      moq: 10,
      unit: 'piece',
      bulkPricing: [
        { minQty: 10, maxQty: 49, price: 85.00 },
        { minQty: 50, maxQty: 99, price: 78.00 },
        { minQty: 100, price: 72.00 }
      ],
      stock: 2000,
      images: [
        { url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Grade', '304'],
        ['Thickness', '2mm'],
        ['Dimensions', '1220x2440mm'],
        ['Finish', '2B Mirror'],
        ['Density', '7.93 g/cm³']
      ]),
      tags: ['stainless steel', 'metal sheet', 'raw material', 'industrial'],
      leadTime: '7-14 days',
      status: 'active'
    },
    {
      name: 'Industrial Safety Helmet',
      description: 'ANSI/ISEA Z89.1 certified safety helmet with 4-point suspension. Lightweight HDPE construction.',
      category: 'Industrial Equipment',
      subcategory: 'Safety Equipment',
      supplierId: suppliers[2]._id,
      price: 6.50,
      moq: 100,
      unit: 'piece',
      bulkPricing: [
        { minQty: 100, maxQty: 499, price: 6.50 },
        { minQty: 500, maxQty: 999, price: 5.75 },
        { minQty: 1000, price: 5.00 }
      ],
      stock: 50000,
      images: [
        { url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400', isPrimary: true }
      ],
      specifications: new Map([
        ['Material', 'HDPE'],
        ['Certification', 'ANSI/ISEA Z89.1'],
        ['Suspension', '4-point'],
        ['Colors', 'White, Yellow, Red, Blue']
      ]),
      tags: ['safety', 'helmet', 'PPE', 'industrial', 'construction'],
      leadTime: '3-7 days',
      status: 'active'
    }
  ];

  const createdProducts = await Product.create(products);
  console.log(`✅ Created ${createdProducts.length} products`);
  return createdProducts;
};

// Seed RFQs
const seedRFQs = async (users, suppliers, products) => {
  console.log('📋 Seeding RFQs...');
  
  const buyers = users.filter(u => u.role === 'buyer');
  
  // Create RFQs one at a time to let the pre-save hook generate unique rfqNumbers
  const rfqData = [
    {
      buyerId: buyers[0]._id,
      productId: products[0]._id,
      productName: products[0].name,
      productImage: products[0].images?.[0]?.url,
      quantity: 5000,
      unit: 'piece',
      targetPrice: 3.00,
      currency: 'USD',
      requirements: 'Looking for bulk USB-C cables for our retail stores. Need reliable quality with warranty. Must include 1-year warranty and individual packaging for retail.',
      deliveryAddress: {
        country: 'United States',
        city: 'New York'
      },
      shippingTerms: 'FOB',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      buyerId: buyers[1]._id,
      productId: products[3]._id,
      productName: products[3].name,
      quantity: 500,
      unit: 'piece',
      targetPrice: 13.00,
      currency: 'USD',
      requirements: 'Need gaming keyboards for our esports center. Looking for quality mechanical switches with RGB lighting and hot-swappable switches preferred.',
      deliveryAddress: {
        country: 'United States',
        city: 'Los Angeles'
      },
      shippingTerms: 'FOB',
      expiresAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      status: 'open'
    },
    {
      buyerId: buyers[0]._id,
      productName: 'Custom Electronic Enclosures',
      productDescription: 'Need custom ABS plastic enclosures for our IoT devices.',
      quantity: 1000,
      unit: 'piece',
      targetPrice: 15.00,
      currency: 'USD',
      requirements: 'Dimensions: 120x80x35mm, IP65 water resistance, custom logo printing required.',
      deliveryAddress: {
        country: 'Germany',
        city: 'Berlin'
      },
      shippingTerms: 'DDP',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'open'
    }
  ];

  const createdRFQs = [];
  for (const data of rfqData) {
    const rfq = new RFQ(data);
    await rfq.save();
    createdRFQs.push(rfq);
  }
  
  // Add a quote to the first RFQ
  createdRFQs[0].quotes.push({
    supplierId: suppliers[0]._id,
    unitPrice: 3.25,
    totalPrice: 16250,
    leadTime: '10-15 days',
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    notes: 'We can offer better pricing for orders above 10,000 units.',
    status: 'pending'
  });
  await createdRFQs[0].save();
  
  console.log(`✅ Created ${createdRFQs.length} RFQs`);
  return createdRFQs;
};

// Seed Conversations
const seedConversations = async (users, suppliers, products) => {
  console.log('💬 Seeding conversations...');
  
  const buyers = users.filter(u => u.role === 'buyer');
  const supplierUsers = users.filter(u => u.role === 'supplier');
  
  const conversations = [
    {
      participants: [
        { userId: buyers[0]._id, role: 'buyer', unreadCount: 0 },
        { userId: supplierUsers[0]._id, role: 'supplier', unreadCount: 1 }
      ],
      relatedProduct: {
        productId: products[0]._id,
        name: products[0].name,
        image: products[0].images?.[0]?.url
      },
      messages: [
        {
          senderId: buyers[0]._id,
          content: 'Hi, I\'m interested in your USB-C cables. Can you provide samples before bulk order?',
          type: 'text',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          senderId: supplierUsers[0]._id,
          content: 'Hello! Yes, we can provide samples. We charge $20 for a sample pack of 5 cables, which is refunded on orders above $500.',
          type: 'text',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000)
        },
        {
          senderId: buyers[0]._id,
          content: 'That sounds good. Can you also send me your product catalog?',
          type: 'text',
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      ],
      status: 'active',
      metadata: {
        lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        totalMessages: 3
      }
    },
    {
      participants: [
        { userId: buyers[1]._id, role: 'buyer', unreadCount: 0 },
        { userId: supplierUsers[1]._id, role: 'supplier', unreadCount: 0 }
      ],
      relatedProduct: {
        productId: products[3]._id,
        name: products[3].name
      },
      messages: [
        {
          senderId: buyers[1]._id,
          content: 'Hello, do you offer customization for the gaming keyboards?',
          type: 'text',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
          senderId: supplierUsers[1]._id,
          content: 'Yes, we offer custom keycaps, switch selection, and even custom color schemes for the RGB lighting. MOQ for customization is 100 units.',
          type: 'text',
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000)
        }
      ],
      status: 'active',
      metadata: {
        lastActivity: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 7200000),
        totalMessages: 2
      }
    }
  ];

  const createdConversations = await Conversation.create(conversations);
  console.log(`✅ Created ${createdConversations.length} conversations`);
  return createdConversations;
};

// Main seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('\n🌱 Starting database seed...\n');
    
    await clearData();
    
    const users = await seedUsers();
    const suppliers = await seedSuppliers(users);
    const products = await seedProducts(suppliers);
    await seedRFQs(users, suppliers, products);
    await seedConversations(users, suppliers, products);
    
    console.log('\n✅ Database seeded successfully!\n');
    console.log('📝 Test Accounts:');
    console.log('─────────────────────────────────────────');
    console.log('Admin:    admin@b2bmarket.com / Admin123!');
    console.log('Buyer:    buyer@example.com / Buyer123!');
    console.log('Buyer:    sarah@buyerco.com / Buyer123!');
    console.log('Supplier: supplier1@example.com / Supplier123!');
    console.log('Supplier: supplier2@example.com / Supplier123!');
    console.log('Supplier: supplier3@example.com / Supplier123!');
    console.log('─────────────────────────────────────────\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();

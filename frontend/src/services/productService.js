// Mock product data - simulating an API
const mockProducts = [
  {
    id: 1,
    name: 'Wireless Bluetooth Headphones',
    price: 29.99,
    originalPrice: 59.99,
    image: 'https://via.placeholder.com/300x300?text=Headphones',
    category: 'Electronics',
    rating: 4.5,
    reviews: 1250,
    description: 'High-quality wireless headphones with noise cancellation',
    inStock: true
  },
  {
    id: 2,
    name: 'USB-C Cable 2m',
    price: 8.99,
    originalPrice: 15.99,
    image: 'https://via.placeholder.com/300x300?text=USB+Cable',
    category: 'Cables & Adapters',
    rating: 4.8,
    reviews: 2100,
    description: 'Fast charging USB-C cable compatible with all devices',
    inStock: true
  },
  {
    id: 3,
    name: 'Phone Screen Protector',
    price: 5.99,
    originalPrice: 12.99,
    image: 'https://via.placeholder.com/300x300?text=Screen+Protector',
    category: 'Phone Accessories',
    rating: 4.6,
    reviews: 890,
    description: 'Tempered glass screen protector for smartphones',
    inStock: true
  },
  {
    id: 4,
    name: 'Portable Power Bank',
    price: 19.99,
    originalPrice: 39.99,
    image: 'https://via.placeholder.com/300x300?text=Power+Bank',
    category: 'Electronics',
    rating: 4.7,
    reviews: 3400,
    description: '20000mAh portable power bank with fast charging',
    inStock: true
  },
  {
    id: 5,
    name: 'LED Desk Lamp',
    price: 24.99,
    originalPrice: 49.99,
    image: 'https://via.placeholder.com/300x300?text=Desk+Lamp',
    category: 'Lighting',
    rating: 4.4,
    reviews: 567,
    description: 'Adjustable LED desk lamp with USB charging port',
    inStock: true
  },
  {
    id: 6,
    name: 'Wireless Mouse',
    price: 12.99,
    originalPrice: 29.99,
    image: 'https://via.placeholder.com/300x300?text=Wireless+Mouse',
    category: 'Computer Accessories',
    rating: 4.5,
    reviews: 1876,
    description: 'Ergonomic wireless mouse with precision tracking',
    inStock: true
  },
  {
    id: 7,
    name: 'Phone Stand',
    price: 9.99,
    originalPrice: 19.99,
    image: 'https://via.placeholder.com/300x300?text=Phone+Stand',
    category: 'Phone Accessories',
    rating: 4.3,
    reviews: 745,
    description: 'Adjustable phone stand for desk or travel',
    inStock: true
  },
  {
    id: 8,
    name: 'Webcam HD 1080p',
    price: 34.99,
    originalPrice: 69.99,
    image: 'https://via.placeholder.com/300x300?text=Webcam',
    category: 'Electronics',
    rating: 4.6,
    reviews: 2234,
    description: 'Full HD 1080p webcam with auto focus',
    inStock: true
  },
  {
    id: 9,
    name: 'Keyboard Mechanical',
    price: 44.99,
    originalPrice: 89.99,
    image: 'https://via.placeholder.com/300x300?text=Keyboard',
    category: 'Computer Accessories',
    rating: 4.7,
    reviews: 1650,
    description: 'Mechanical RGB keyboard with quiet switches',
    inStock: true
  },
  {
    id: 10,
    name: 'Phone Charger 65W',
    price: 22.99,
    originalPrice: 45.99,
    image: 'https://via.placeholder.com/300x300?text=Charger',
    category: 'Cables & Adapters',
    rating: 4.8,
    reviews: 3100,
    description: 'Fast 65W charger compatible with most devices',
    inStock: true
  },
  {
    id: 11,
    name: 'Tablet Screen Protector',
    price: 6.99,
    originalPrice: 14.99,
    image: 'https://via.placeholder.com/300x300?text=Tablet+Protector',
    category: 'Tablet Accessories',
    rating: 4.4,
    reviews: 432,
    description: 'Premium tempered glass for tablets',
    inStock: true
  },
  {
    id: 12,
    name: 'Bluetooth Speaker',
    price: 39.99,
    originalPrice: 79.99,
    image: 'https://via.placeholder.com/300x300?text=Speaker',
    category: 'Electronics',
    rating: 4.6,
    reviews: 2876,
    description: 'Waterproof portable Bluetooth speaker',
    inStock: true
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

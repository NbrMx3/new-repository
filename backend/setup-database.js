const pool = require('./config/database');

const setupDatabase = async () => {
  try {
    console.log('🚀 Setting up database tables...\n');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        avatar TEXT,
        join_date VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // User addresses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_addresses (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) DEFAULT 'home',
        name VARCHAR(100),
        street VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(100),
        zip VARCHAR(20),
        country VARCHAR(100),
        phone VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User addresses table created');

    // Products table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        original_price DECIMAL(10,2),
        image TEXT,
        category VARCHAR(100),
        brand VARCHAR(100),
        stock INT DEFAULT 0,
        rating DECIMAL(2,1) DEFAULT 0,
        reviews_count INT DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_deal BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Products table created');

    // Cart table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        quantity INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log('✅ Cart table created');

    // Wishlist table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `);
    console.log('✅ Wishlist table created');

    // Orders table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        order_number VARCHAR(50) UNIQUE,
        subtotal DECIMAL(10,2) NOT NULL,
        shipping DECIMAL(10,2) DEFAULT 0,
        tax DECIMAL(10,2) DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        shipping_address JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Orders table created');

    // Order items table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255),
        product_image TEXT,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Order items table created');

    // Notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        icon VARCHAR(20),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Notifications table created');

    // User settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        theme VARCHAR(20) DEFAULT 'light',
        language VARCHAR(10) DEFAULT 'en',
        notifications_push BOOLEAN DEFAULT TRUE,
        notifications_order_updates BOOLEAN DEFAULT TRUE,
        notifications_promotions BOOLEAN DEFAULT TRUE,
        notifications_price_drops BOOLEAN DEFAULT TRUE,
        notifications_back_in_stock BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ User settings table created');

    // Insert sample products
    const productCount = await pool.query('SELECT COUNT(*) FROM products');
    if (parseInt(productCount.rows[0].count) === 0) {
      console.log('\n📦 Inserting sample products...');
      
      const sampleProducts = [
        { name: 'Wireless Bluetooth Headphones', description: 'Premium noise-canceling headphones with 30-hour battery life', price: 79.99, original_price: 129.99, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', category: 'Electronics', brand: 'AudioMax', stock: 50, rating: 4.5, reviews_count: 234 },
        { name: 'Smart Watch Pro', description: 'Fitness tracker with heart rate monitor and GPS', price: 199.99, original_price: 299.99, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Electronics', brand: 'TechFit', stock: 30, rating: 4.7, reviews_count: 567 },
        { name: 'Laptop Backpack', description: 'Water-resistant backpack with USB charging port', price: 49.99, original_price: 69.99, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', category: 'Bags', brand: 'TravelPro', stock: 100, rating: 4.3, reviews_count: 189 },
        { name: 'Portable Power Bank', description: '20000mAh fast charging power bank', price: 39.99, original_price: 59.99, image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', category: 'Electronics', brand: 'PowerMax', stock: 75, rating: 4.6, reviews_count: 423 },
        { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse with silent clicks', price: 29.99, original_price: 44.99, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400', category: 'Electronics', brand: 'ClickPro', stock: 150, rating: 4.4, reviews_count: 312 },
        { name: 'Running Shoes', description: 'Lightweight running shoes with cushioned sole', price: 89.99, original_price: 119.99, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Shoes', brand: 'SportRun', stock: 60, rating: 4.8, reviews_count: 678 },
        { name: 'Coffee Maker', description: 'Programmable coffee maker with thermal carafe', price: 69.99, original_price: 99.99, image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400', category: 'Home', brand: 'BrewMaster', stock: 40, rating: 4.5, reviews_count: 234 },
        { name: 'Yoga Mat', description: 'Non-slip yoga mat with carrying strap', price: 24.99, original_price: 34.99, image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', category: 'Sports', brand: 'ZenFit', stock: 200, rating: 4.6, reviews_count: 456 },
        { name: 'Desk Lamp LED', description: 'Adjustable LED desk lamp with USB port', price: 34.99, original_price: 49.99, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', category: 'Home', brand: 'LightPro', stock: 80, rating: 4.4, reviews_count: 178 },
        { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches', price: 79.99, original_price: 109.99, image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', category: 'Electronics', brand: 'KeyMaster', stock: 45, rating: 4.7, reviews_count: 523 },
      ];

      for (const product of sampleProducts) {
        await pool.query(
          `INSERT INTO products (name, description, price, original_price, image, category, brand, stock, rating, reviews_count)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [product.name, product.description, product.price, product.original_price, product.image, product.category, product.brand, product.stock, product.rating, product.reviews_count]
        );
      }
      console.log('✅ Sample products inserted');
    }

    console.log('\n🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
};

setupDatabase();

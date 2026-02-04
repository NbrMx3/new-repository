const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function setupDatabase() {
  console.log('🔄 Setting up Neon database tables...\n');

  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(500),
        phone VARCHAR(20),
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Users table created');

    // Create products table
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        category VARCHAR(100),
        brand VARCHAR(100),
        image VARCHAR(500),
        images TEXT[],
        stock INTEGER DEFAULT 0,
        rating DECIMAL(3, 2) DEFAULT 0,
        reviews_count INTEGER DEFAULT 0,
        is_featured BOOLEAN DEFAULT FALSE,
        is_deal BOOLEAN DEFAULT FALSE,
        discount_percent INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Products table created');

    // Create cart table
    await sql`
      CREATE TABLE IF NOT EXISTS cart (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `;
    console.log('✅ Cart table created');

    // Create wishlist table
    await sql`
      CREATE TABLE IF NOT EXISTS wishlist (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, product_id)
      )
    `;
    console.log('✅ Wishlist table created');

    // Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        payment_method VARCHAR(50),
        payment_status VARCHAR(50) DEFAULT 'pending',
        tracking_number VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Orders table created');

    // Create order_items table
    await sql`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name VARCHAR(255),
        quantity INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Order items table created');

    // Create reviews table
    await sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Reviews table created');

    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255),
        message TEXT,
        type VARCHAR(50),
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Notifications table created');

    // Insert sample products
    console.log('\n🔄 Inserting sample products...');
    
    const existingProducts = await sql`SELECT COUNT(*) as count FROM products`;
    
    if (parseInt(existingProducts[0].count) === 0) {
      await sql`
        INSERT INTO products (name, description, price, original_price, category, brand, image, stock, rating, reviews_count, is_featured, is_deal, discount_percent) VALUES
        ('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation and 30-hour battery life', 79.99, 129.99, 'Electronics', 'AudioTech', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', 50, 4.5, 128, true, true, 38),
        ('Smart Fitness Watch', 'Track your health and fitness with GPS, heart rate monitor, and sleep tracking', 199.99, 249.99, 'Electronics', 'FitPro', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', 35, 4.7, 256, true, false, 20),
        ('Premium Leather Wallet', 'Genuine leather bifold wallet with RFID blocking technology', 49.99, 69.99, 'Accessories', 'LeatherCraft', 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500', 100, 4.3, 89, false, true, 29),
        ('Running Shoes Pro', 'Lightweight and breathable running shoes with advanced cushioning', 129.99, 159.99, 'Sports', 'SpeedRun', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', 75, 4.6, 312, true, false, 19),
        ('Organic Coffee Beans', 'Premium arabica coffee beans, ethically sourced and freshly roasted', 24.99, 29.99, 'Food', 'BeanMaster', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500', 200, 4.8, 567, false, true, 17),
        ('Portable Power Bank', '20000mAh fast charging power bank with dual USB ports', 39.99, 59.99, 'Electronics', 'PowerMax', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500', 150, 4.4, 203, false, true, 33),
        ('Stainless Steel Water Bottle', 'Insulated water bottle keeps drinks cold 24hrs or hot 12hrs', 29.99, 39.99, 'Home', 'HydroLife', 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500', 300, 4.5, 445, true, false, 25),
        ('Wireless Mouse', 'Ergonomic wireless mouse with adjustable DPI and silent clicks', 34.99, 44.99, 'Electronics', 'TechGear', 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', 120, 4.2, 178, false, false, 22),
        ('Yoga Mat Premium', 'Non-slip eco-friendly yoga mat with alignment lines', 44.99, 59.99, 'Sports', 'ZenFit', 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500', 80, 4.6, 234, true, true, 25),
        ('Desk Lamp LED', 'Adjustable LED desk lamp with multiple brightness levels and USB charging port', 54.99, 74.99, 'Home', 'BrightLight', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500', 60, 4.4, 156, false, false, 27),
        ('Backpack Travel Pro', 'Water-resistant travel backpack with laptop compartment and USB port', 89.99, 119.99, 'Accessories', 'TravelGear', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500', 45, 4.7, 289, true, true, 25),
        ('Ceramic Plant Pot Set', 'Set of 3 minimalist ceramic plant pots with drainage holes', 34.99, 49.99, 'Home', 'GreenLife', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500', 90, 4.3, 123, false, false, 30)
      `;
      console.log('✅ Sample products inserted');
    } else {
      console.log('ℹ️  Products already exist, skipping sample data');
    }

    // Insert a demo user
    const existingUsers = await sql`SELECT COUNT(*) as count FROM users`;
    
    if (parseInt(existingUsers[0].count) === 0) {
      await sql`
        INSERT INTO users (name, email, password) VALUES
        ('Demo User', 'demo@example.com', 'demo123')
      `;
      console.log('✅ Demo user created (email: demo@example.com, password: demo123)');
    } else {
      console.log('ℹ️  Users already exist, skipping demo user');
    }

    console.log('\n🎉 Database setup complete!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

setupDatabase();

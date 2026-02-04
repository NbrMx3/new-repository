const express = require('express');
const cors = require('cors');
const sql = require('./config/database');
const crypto = require('crypto');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Simple token generation (in production, use JWT)
const generateToken = (userId) => {
  return crypto.randomBytes(32).toString('hex') + '_' + userId;
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API' });
});

// Products routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, limit = 20, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    
    if (category) {
      query += ` AND category = $${params.length + 1}`;
      params.push(category);
    }
    
    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }
    
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
    
    const products = await sql(query, params);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const result = await sql('SELECT * FROM products WHERE id = $1', [req.params.id]);
    if (result.length > 0) {
      res.json({ success: true, product: result[0] });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existing = await sql('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    
    // Insert new user (in production, hash the password!)
    const result = await sql(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name, email, password]
    );
    
    const user = result[0];
    const token = generateToken(user.id);
    
    res.json({ success: true, message: 'Registration successful', user, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await sql(
      'SELECT id, name, email FROM users WHERE email = $1 AND password = $2',
      [email, password]
    );
    
    if (result.length > 0) {
      const user = result[0];
      const token = generateToken(user.id);
      res.json({ success: true, message: 'Login successful', user, token });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = token.split('_').pop();
    
    const result = await sql('SELECT id, name, email FROM users WHERE id = $1', [userId]);
    
    if (result.length > 0) {
      res.json(result[0]);
    } else {
      res.status(401).json({ success: false, error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cart routes
app.get('/api/cart', async (req, res) => {
  try {
    const userId = req.query.userId || 1; // Mock user ID for now
    const result = await sql(
      'SELECT c.*, p.name, p.price, p.image FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = $1',
      [userId]
    );
    res.json({ success: true, items: result });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.json({ success: true, items: [] }); // Return empty cart on error
  }
});

app.post('/api/cart', async (req, res) => {
  try {
    const { userId = 1, productId, quantity = 1 } = req.body;
    
    const result = await sql(
      'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart.quantity + $3 RETURNING *',
      [userId, productId, quantity]
    );
    
    res.json({ success: true, item: result[0] });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Wishlist routes
app.get('/api/wishlist', async (req, res) => {
  try {
    const userId = req.query.userId || 1;
    const result = await sql(
      'SELECT w.*, p.name, p.price, p.image FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = $1',
      [userId]
    );
    res.json({ success: true, items: result });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.json({ success: true, items: [] });
  }
});

// Orders routes
app.get('/api/orders', async (req, res) => {
  try {
    const userId = req.query.userId || 1;
    const result = await sql(
      'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json({ success: true, orders: result });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.json({ success: true, orders: [] });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

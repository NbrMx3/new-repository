const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock data for demo
const mockProducts = [
  { id: 1, name: 'Sample Product 1', price: 29.99, category: 'electronics', image: 'https://via.placeholder.com/300' },
  { id: 2, name: 'Sample Product 2', price: 49.99, category: 'clothing', image: 'https://via.placeholder.com/300' },
  { id: 3, name: 'Sample Product 3', price: 19.99, category: 'books', image: 'https://via.placeholder.com/300' }
];

// Routes - Mock endpoints without database
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API is running' });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API' });
});

app.get('/api/products', (req, res) => {
  res.json({ success: true, products: mockProducts });
});

app.get('/api/products/:id', (req, res) => {
  const product = mockProducts.find(p => p.id === parseInt(req.params.id));
  if (product) {
    res.json({ success: true, product });
  } else {
    res.status(404).json({ success: false, message: 'Product not found' });
  }
});

app.post('/api/auth/register', (req, res) => {
  res.json({ success: true, message: 'Registration successful', token: 'mock-token' });
});

app.post('/api/auth/login', (req, res) => {
  res.json({ success: true, message: 'Login successful', token: 'mock-token' });
});

app.get('/api/cart', (req, res) => {
  res.json({ success: true, items: [] });
});

app.get('/api/wishlist', (req, res) => {
  res.json({ success: true, items: [] });
});

app.get('/api/orders', (req, res) => {
  res.json({ success: true, orders: [] });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

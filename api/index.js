const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes from backend
const authRoutes = require('../backend/routes/auth');
const usersRoutes = require('../backend/routes/users');
const productsRoutes = require('../backend/routes/products');
const cartRoutes = require('../backend/routes/cart');
const wishlistRoutes = require('../backend/routes/wishlist');
const ordersRoutes = require('../backend/routes/orders');
const notificationsRoutes = require('../backend/routes/notifications');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/notifications', notificationsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API is running' });
});

// Root API route
app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'E-commerce API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get wishlist items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id as wishlist_id, w.created_at as added_at, 
              p.id, p.name, p.price, p.original_price, p.image, p.category, p.rating, p.stock
       FROM wishlist w
       JOIN products p ON w.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    );

    const wishlistItems = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      price: parseFloat(row.price),
      originalPrice: parseFloat(row.original_price),
      image: row.image,
      category: row.category,
      rating: parseFloat(row.rating),
      stock: row.stock,
      addedAt: row.added_at
    }));

    res.json(wishlistItems);
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add to wishlist
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if product exists
    const product = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to wishlist (ignore if already exists)
    await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING`,
      [req.user.id, productId]
    );

    res.status(201).json({ message: 'Added to wishlist' });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Toggle wishlist (add if not exists, remove if exists)
router.post('/toggle', authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;

    // Check if in wishlist
    const existing = await pool.query(
      'SELECT id FROM wishlist WHERE user_id = $1 AND product_id = $2',
      [req.user.id, productId]
    );

    if (existing.rows.length > 0) {
      // Remove from wishlist
      await pool.query(
        'DELETE FROM wishlist WHERE user_id = $1 AND product_id = $2',
        [req.user.id, productId]
      );
      res.json({ message: 'Removed from wishlist', added: false });
    } else {
      // Add to wishlist
      await pool.query(
        'INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2)',
        [req.user.id, productId]
      );
      res.json({ message: 'Added to wishlist', added: true });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({ error: 'Failed to toggle wishlist' });
  }
});

module.exports = router;

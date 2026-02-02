const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Get cart items
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.quantity, p.id as product_id, p.name, p.price, p.original_price, 
              p.image, p.category, p.stock
       FROM cart c
       JOIN products p ON c.product_id = p.id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    const cartItems = result.rows.map(row => ({
      id: row.product_id,
      name: row.name,
      price: parseFloat(row.price),
      originalPrice: parseFloat(row.original_price),
      image: row.image,
      category: row.category,
      quantity: row.quantity,
      stock: row.stock,
      cartItemId: row.id
    }));

    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to get cart' });
  }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Check if product exists
    const product = await pool.query('SELECT id, stock FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add or update cart item
    const result = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) 
       DO UPDATE SET quantity = cart.quantity + $3
       RETURNING *`,
      [req.user.id, productId, quantity]
    );

    res.status(201).json({ message: 'Added to cart', item: result.rows[0] });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Update cart item quantity
router.put('/:productId', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      await pool.query(
        'DELETE FROM cart WHERE user_id = $1 AND product_id = $2',
        [req.user.id, req.params.productId]
      );
      return res.json({ message: 'Item removed from cart' });
    }

    const result = await pool.query(
      `UPDATE cart SET quantity = $1 
       WHERE user_id = $2 AND product_id = $3
       RETURNING *`,
      [quantity, req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Cart updated', item: result.rows[0] });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Failed to update cart' });
  }
});

// Remove from cart
router.delete('/:productId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING id',
      [req.user.id, req.params.productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Clear cart
router.delete('/', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM cart WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
});

module.exports = router;

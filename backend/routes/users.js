const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

// Update user profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, avatar } = req.body;
    
    // If email is being updated, check if it's already in use by another user
    if (email) {
      const emailCheck = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email.trim().toLowerCase(), req.user.id]
      );
      
      if (emailCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use by another account' });
      }
    }
    
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone),
           avatar = COALESCE($4, avatar),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, name, email, phone, avatar, join_date`,
      [name, email ? email.trim().toLowerCase() : null, phone, avatar, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add address
router.post('/addresses', authMiddleware, async (req, res) => {
  try {
    const { type, name, street, city, state, zip, country, phone, isDefault } = req.body;

    // If this is default, remove default from others
    if (isDefault) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      `INSERT INTO user_addresses (user_id, type, name, street, city, state, zip, country, phone, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [req.user.id, type, name, street, city, state, zip, country, phone, isDefault || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const { type, name, street, city, state, zip, country, phone, isDefault } = req.body;

    if (isDefault) {
      await pool.query('UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1', [req.user.id]);
    }

    const result = await pool.query(
      `UPDATE user_addresses 
       SET type = $1, name = $2, street = $3, city = $4, state = $5, 
           zip = $6, country = $7, phone = $8, is_default = $9
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [type, name, street, city, state, zip, country, phone, isDefault, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/addresses/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Get user settings
router.get('/settings', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default settings
      const newSettings = await pool.query(
        'INSERT INTO user_settings (user_id) VALUES ($1) RETURNING *',
        [req.user.id]
      );
      return res.json(newSettings.rows[0]);
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update user settings
router.put('/settings', authMiddleware, async (req, res) => {
  try {
    const { theme, language, notifications_push, notifications_order_updates, 
            notifications_promotions, notifications_price_drops, notifications_back_in_stock } = req.body;

    const result = await pool.query(
      `INSERT INTO user_settings (user_id, theme, language, notifications_push, 
         notifications_order_updates, notifications_promotions, notifications_price_drops, notifications_back_in_stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id) DO UPDATE SET
         theme = COALESCE($2, user_settings.theme),
         language = COALESCE($3, user_settings.language),
         notifications_push = COALESCE($4, user_settings.notifications_push),
         notifications_order_updates = COALESCE($5, user_settings.notifications_order_updates),
         notifications_promotions = COALESCE($6, user_settings.notifications_promotions),
         notifications_price_drops = COALESCE($7, user_settings.notifications_price_drops),
         notifications_back_in_stock = COALESCE($8, user_settings.notifications_back_in_stock),
         updated_at = NOW()
       RETURNING *`,
      [req.user.id, theme, language, notifications_push, notifications_order_updates, 
       notifications_promotions, notifications_price_drops, notifications_back_in_stock]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;

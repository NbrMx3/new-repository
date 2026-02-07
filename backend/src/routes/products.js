const express = require('express');
const router = express.Router();
const pool = require('../config/database');

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, limit, offset } = req.query;
    
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    // Sorting
    switch (sort) {
      case 'price_asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price_desc':
        query += ' ORDER BY price DESC';
        break;
      case 'rating':
        query += ' ORDER BY rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY created_at DESC';
        break;
      default:
        query += ' ORDER BY id ASC';
    }

    // Pagination
    if (limit) {
      paramCount++;
      query += ` LIMIT $${paramCount}`;
      params.push(parseInt(limit));
    }

    if (offset) {
      paramCount++;
      query += ` OFFSET $${paramCount}`;
      params.push(parseInt(offset));
    }

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
    const countParams = [];
    let countParamNum = 0;

    if (category) {
      countParamNum++;
      countQuery += ` AND category = $${countParamNum}`;
      countParams.push(category);
    }

    if (search) {
      countParamNum++;
      countQuery += ` AND (name ILIKE $${countParamNum} OR description ILIKE $${countParamNum})`;
      countParams.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      products: result.rows,
      total: parseInt(countResult.rows[0].count)
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to get products' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to get product' });
  }
});

// Get categories
router.get('/meta/categories', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT category, COUNT(*) as count FROM products GROUP BY category ORDER BY category'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Get deals/featured products
router.get('/meta/deals', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM products 
       WHERE original_price > price 
       ORDER BY ((original_price - price) / original_price) DESC 
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Failed to get deals' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../modules/db');

// GET /browse - render the form with defaults
router.get('/', (req, res) => {
  res.render('browse/index', {
    title: 'Browse Restaurants',
    form: { page: 1, perPage: 5, borough: '' },
    result: null,
    error: null
  });
});

// POST /browse - handle form submit and render results
router.post('/', async (req, res) => {
  try {
    const { page, perPage, borough } = req.body;

    // Validate inputs
    const errors = [];
    const allowedBoroughRegex = /^[a-zA-Z\s\-']*$/;

    const pageNum = parseInt(page, 10);
    const perPageNum = parseInt(perPage, 10);

    if (!Number.isInteger(pageNum) || pageNum < 1 || pageNum > 10000) {
      errors.push('Page must be a positive integer between 1 and 10000');
    }
    if (!Number.isInteger(perPageNum) || perPageNum < 1 || perPageNum > 100) {
      errors.push('Per Page must be a positive integer between 1 and 100');
    }

    let boroughFilter = null;
    if (typeof borough === 'string' && borough.trim().length > 0) {
      if (borough.trim().length > 50 || !allowedBoroughRegex.test(borough.trim())) {
        errors.push('Borough may only contain letters, spaces, hyphens, apostrophes and be at most 50 chars');
      } else {
        boroughFilter = borough.trim();
      }
    }

    if (errors.length) {
      return res.status(400).render('browse/index', {
        title: 'Browse Restaurants',
        form: { page, perPage, borough },
        result: null,
        error: errors.join('. ')
      });
    }

    const restaurants = await db.getAllRestaurants(pageNum, perPageNum, boroughFilter);

    return res.status(200).render('browse/index', {
      title: 'Browse Restaurants',
      form: { page: pageNum, perPage: perPageNum, borough: boroughFilter || '' },
      result: {
        rows: restaurants,
        totalReturned: restaurants.length,
        page: pageNum,
        perPage: perPageNum,
        hasMore: restaurants.length === perPageNum,
        borough: boroughFilter
      },
      error: null
    });
  } catch (err) {
    console.error('Browse error:', err);
    return res.status(500).render('browse/index', {
      title: 'Browse Restaurants',
      form: req.body,
      result: null,
      error: 'Internal server error. Please try again later.'
    });
  }
});

module.exports = router; 
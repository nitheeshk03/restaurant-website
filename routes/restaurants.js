const express = require('express');
const router = express.Router();
const db = require('../modules/db');

// GET /api/restaurants - Get all restaurants with pagination and optional borough filter
router.get('/', async (req, res) => {
  try {
    const { page, perPage, borough, ...extraParams } = req.query;
    
    // === QUERY PARAMETER VALIDATION ===
    
    // 1. Check for unexpected query parameters
    const allowedParams = ['page', 'perPage', 'borough'];
    const extraParamKeys = Object.keys(extraParams);
    if (extraParamKeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid query parameters: ${extraParamKeys.join(', ')}. Allowed parameters: ${allowedParams.join(', ')}`
      });
    }

    // 2. Validate 'page' parameter
    let pageNum = 1; // default value
    if (page !== undefined) {
      // Check if page is a valid number string
      if (!/^\d+$/.test(page)) {
        return res.status(400).json({
          success: false,
          message: 'Page parameter must be a positive integer'
        });
      }
      
      pageNum = parseInt(page, 10);
      
      if (pageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'Page parameter must be greater than 0'
        });
      }
      
      if (pageNum > 10000) { // reasonable upper limit
        return res.status(400).json({
          success: false,
          message: 'Page parameter cannot exceed 10000'
        });
      }
    }

    // 3. Validate 'perPage' parameter
    let perPageNum = 10; // default value
    if (perPage !== undefined) {
      // Check if perPage is a valid number string
      if (!/^\d+$/.test(perPage)) {
        return res.status(400).json({
          success: false,
          message: 'perPage parameter must be a positive integer'
        });
      }
      
      perPageNum = parseInt(perPage, 10);
      
      if (perPageNum < 1) {
        return res.status(400).json({
          success: false,
          message: 'perPage parameter must be greater than 0'
        });
      }
      
      if (perPageNum > 100) {
        return res.status(400).json({
          success: false,
          message: 'perPage parameter cannot exceed 100 items'
        });
      }
    }

    // 4. Validate 'borough' parameter
    let boroughFilter = null;
    if (borough !== undefined) {
      // Check if borough is a string
      if (typeof borough !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Borough parameter must be a string'
        });
      }
      
      // Trim whitespace and check if not empty
      const trimmedBorough = borough.trim();
      if (trimmedBorough.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Borough parameter cannot be empty'
        });
      }
      
      // Check for reasonable length
      if (trimmedBorough.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Borough parameter cannot exceed 50 characters'
        });
      }
      
      // Check for valid characters (letters, spaces, hyphens, apostrophes)
      if (!/^[a-zA-Z\s\-']+$/.test(trimmedBorough)) {
        return res.status(400).json({
          success: false,
          message: 'Borough parameter can only contain letters, spaces, hyphens, and apostrophes'
        });
      }
      
      boroughFilter = trimmedBorough;
    }

    // === PARAMETER VALIDATION COMPLETE ===
    
    // Call database function with validated parameters
    const restaurants = await db.getAllRestaurants(pageNum, perPageNum, boroughFilter);
    
    // Calculate additional pagination info
    const totalReturned = restaurants.length;
    const hasMore = totalReturned === perPageNum;
    
    // Return 200 OK with validated data
    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        page: pageNum,
        perPage: perPageNum,
        totalReturned: totalReturned,
        hasMore: hasMore
      },
      filter: boroughFilter ? { borough: boroughFilter } : null,
      query: {
        page: pageNum,
        perPage: perPageNum,
        borough: boroughFilter
      }
    });
    
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching restaurants',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/restaurants/:id - Get restaurant by ID
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    const restaurant = await db.getRestaurantById(req.params.id);
    
    // Return 200 OK with restaurant data
    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    console.error(`Error fetching restaurant ${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with ID ${req.params.id} not found`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/restaurants - Create new restaurant
router.post('/', async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required to create a restaurant'
      });
    }
    
    const restaurant = await db.addNewRestaurant(req.body);
    
    // Return 201 Created for successful creation
    res.status(201).json({
      success: true,
      data: restaurant,
      message: 'Restaurant created successfully'
    });
  } catch (error) {
    console.error('Error creating restaurant:', error);
    
    // Handle validation errors
    if (error.message.includes('validation') || 
        error.message.includes('required') ||
        error.message.includes('duplicate') ||
        error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant with this information already exists'
      });
    }
    
    // Return 500 for server errors
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/restaurants/:id - Update restaurant (overwrite)
router.put('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Request body is required to update a restaurant'
      });
    }
    
    const restaurant = await db.updateRestaurantById(req.body, req.params.id);
    
    // Return 200 OK for successful update
    res.status(200).json({
      success: true,
      data: restaurant,
      message: 'Restaurant updated successfully'
    });
  } catch (error) {
    console.error(`Error updating restaurant ${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with ID ${req.params.id} not found`
      });
    }
    
    // Handle validation errors
    if (error.message.includes('validation') || 
        error.message.includes('required') ||
        error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error: ' + error.message
      });
    }
    
    // Return 500 for server errors
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid restaurant ID format'
      });
    }
    
    const restaurant = await db.deleteRestaurantById(req.params.id);
    
    // Return 204 No Content for successful deletion (no body needed)
    res.status(204).send();
    
    // Alternative: Return 200 with confirmation message
    // res.status(200).json({
    //   success: true,
    //   message: 'Restaurant deleted successfully',
    //   deletedId: req.params.id
    // });
  } catch (error) {
    console.error(`Error deleting restaurant ${req.params.id}:`, error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: `Restaurant with ID ${req.params.id} not found`
      });
    }
    
    // Return 500 for server errors
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting restaurant',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Handle invalid routes
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

module.exports = router; 
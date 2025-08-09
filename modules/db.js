const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

let isConnected = false;

const db = {
  /**
   * Initialize database connection
   * @param {string} connectionString - MongoDB connection string
   * @returns {Promise} - Promise that resolves when connected
   */
  async initialize(connectionString) {
    try {
      if (isConnected) {
        console.log('Database already connected');
        return Promise.resolve();
      }

      if (!connectionString) {
        throw new Error('Connection string is required');
      }

      // Set mongoose options
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      };

      // Connect to MongoDB
      await mongoose.connect(connectionString, options);
      
      isConnected = true;
      console.log('✅ Successfully connected to MongoDB Atlas');
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
        isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('📡 MongoDB disconnected');
        isConnected = false;
      });

      return Promise.resolve();
    } catch (error) {
      isConnected = false;
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  },

  /**
   * 1. Create a new restaurant in the collection using the object passed in the "data" parameter
   * @param {Object} data - Restaurant data object
   * @returns {Promise<Object>} - Created restaurant object
   */
  async addNewRestaurant(data) {
    try {
      if (!data) {
        throw new Error('Restaurant data is required');
      }
      
      const restaurant = new Restaurant(data);
      const savedRestaurant = await restaurant.save();
      return savedRestaurant;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      
      if (error.code === 11000) {
        throw new Error('Duplicate restaurant data detected');
      }
      
      throw new Error(`Database error while adding restaurant: ${error.message}`);
    }
  },

  /**
   * 2. Return an array of all restaurants for a specific page (sorted by restaurant_id), 
   * given the number of items per page. Optional "borough" parameter for filtering.
   * @param {number} page - Page number (1-based)
   * @param {number} perPage - Number of items per page
   * @param {string} borough - Optional borough filter
   * @returns {Promise<Array>} - Array of restaurants
   */
  async getAllRestaurants(page, perPage, borough) {
    try {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(perPage) || 10;
      
      if (pageNum < 1) {
        throw new Error('Page number must be greater than 0');
      }
      
      if (limitNum < 1 || limitNum > 100) {
        throw new Error('Items per page must be between 1 and 100');
      }
      
      const skip = (pageNum - 1) * limitNum;

      // Build query
      let query = {};
      if (borough) {
        // Assuming borough is stored in address.borough or a borough field
        query.$or = [
          { 'address.borough': { $regex: borough, $options: 'i' } },
          { 'borough': { $regex: borough, $options: 'i' } }
        ];
      }

      // Sort by _id (restaurant_id) and apply pagination
      const restaurants = await Restaurant.find(query)
        .sort({ _id: 1 }) // Sort by _id (restaurant_id) ascending
        .skip(skip)
        .limit(limitNum)
        .lean();

      return restaurants;
    } catch (error) {
      throw new Error(`Database error while fetching restaurants: ${error.message}`);
    }
  },

  /**
   * 3. Return a single restaurant object whose "_id" value matches the "Id" parameter
   * @param {string} Id - Restaurant ID
   * @returns {Promise<Object>} - Restaurant object
   */
  async getRestaurantById(Id) {
    try {
      if (!Id) {
        throw new Error('Restaurant ID is required');
      }
      
      const restaurant = await Restaurant.findById(Id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return restaurant;
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw new Error('Invalid restaurant ID format');
      }
      
      throw new Error(`Database error while fetching restaurant: ${error.message}`);
    }
  },

  /**
   * 4. Overwrite an existing restaurant whose "_id" value matches the "Id" parameter,
   * using the object passed in the "data" parameter
   * @param {Object} data - Updated restaurant data
   * @param {string} Id - Restaurant ID
   * @returns {Promise<Object>} - Updated restaurant object
   */
  async updateRestaurantById(data, Id) {
    try {
      if (!data) {
        throw new Error('Update data is required');
      }
      
      if (!Id) {
        throw new Error('Restaurant ID is required');
      }
      
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        Id,
        data,
        { 
          new: true, // Return the updated document
          runValidators: true, // Run schema validators
          overwrite: true // Overwrite the entire document
        }
      );
      
      if (!updatedRestaurant) {
        throw new Error('Restaurant not found');
      }
      
      return updatedRestaurant;
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        throw error;
      }
      
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation failed: ${messages.join(', ')}`);
      }
      
      if (error.name === 'CastError') {
        throw new Error('Invalid restaurant ID format');
      }
      
      throw new Error(`Database error while updating restaurant: ${error.message}`);
    }
  },

  /**
   * 5. Delete an existing restaurant whose "_id" value matches the "Id" parameter
   * @param {string} Id - Restaurant ID
   * @returns {Promise<Object>} - Deleted restaurant object
   */
  async deleteRestaurantById(Id) {
    try {
      if (!Id) {
        throw new Error('Restaurant ID is required');
      }
      
      const deletedRestaurant = await Restaurant.findByIdAndDelete(Id);
      
      if (!deletedRestaurant) {
        throw new Error('Restaurant not found');
      }
      
      return deletedRestaurant;
    } catch (error) {
      if (error.message === 'Restaurant not found') {
        throw error;
      }
      
      if (error.name === 'CastError') {
        throw new Error('Invalid restaurant ID format');
      }
      
      throw new Error(`Database error while deleting restaurant: ${error.message}`);
    }
  },

  /**
   * Get connection status
   * @returns {boolean} - True if connected
   */
  isConnected() {
    return isConnected && mongoose.connection.readyState === 1;
  },

  /**
   * Close database connection
   * @returns {Promise} - Promise that resolves when disconnected
   */
  async close() {
    try {
      if (isConnected) {
        await mongoose.connection.close();
        isConnected = false;
        console.log('📡 Database connection closed');
      }
    } catch (error) {
      console.error('❌ Error closing database connection:', error);
      throw error;
    }
  }
};

module.exports = db; 
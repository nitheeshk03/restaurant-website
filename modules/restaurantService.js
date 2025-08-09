const Restaurant = require('../models/Restaurant');

const restaurantService = {
  /**
   * Get all restaurants with optional filtering
   * @param {Object} filters - Optional filters (cuisine, city, etc.)
   * @param {Object} options - Optional pagination and sorting
   * @returns {Promise<Array>} - Array of restaurants
   */
  async getAllRestaurants(filters = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sortBy = 'name', sortOrder = 'asc' } = options;
      const skip = (page - 1) * limit;

      // Build query
      let query = { ...filters };

      // Handle search
      if (filters.search) {
        query.$text = { $search: filters.search };
        delete query.search;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const restaurants = await Restaurant.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean();

      const total = await Restaurant.countDocuments(query);

      return {
        restaurants,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Error fetching restaurants: ${error.message}`);
    }
  },

  /**
   * Get restaurant by ID
   * @param {string} id - Restaurant ID
   * @returns {Promise<Object>} - Restaurant object
   */
  async getRestaurantById(id) {
    try {
      const restaurant = await Restaurant.findById(id);
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      return restaurant;
    } catch (error) {
      throw new Error(`Error fetching restaurant: ${error.message}`);
    }
  },

  /**
   * Create new restaurant
   * @param {Object} restaurantData - Restaurant data
   * @returns {Promise<Object>} - Created restaurant
   */
  async createRestaurant(restaurantData) {
    try {
      const restaurant = new Restaurant(restaurantData);
      await restaurant.save();
      return restaurant;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation error: ${messages.join(', ')}`);
      }
      throw new Error(`Error creating restaurant: ${error.message}`);
    }
  },

  /**
   * Update restaurant by ID
   * @param {string} id - Restaurant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} - Updated restaurant
   */
  async updateRestaurant(id, updateData) {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      return restaurant;
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        throw new Error(`Validation error: ${messages.join(', ')}`);
      }
      throw new Error(`Error updating restaurant: ${error.message}`);
    }
  },

  /**
   * Delete restaurant by ID (soft delete)
   * @param {string} id - Restaurant ID
   * @returns {Promise<Object>} - Deleted restaurant
   */
  async deleteRestaurant(id) {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );
      
      if (!restaurant) {
        throw new Error('Restaurant not found');
      }
      
      return restaurant;
    } catch (error) {
      throw new Error(`Error deleting restaurant: ${error.message}`);
    }
  },

  /**
   * Get restaurants by cuisine type
   * @param {string} cuisine - Cuisine type
   * @returns {Promise<Array>} - Array of restaurants
   */
  async getRestaurantsByCuisine(cuisine) {
    try {
      const restaurants = await Restaurant.find({ 
        cuisine: cuisine
      }).sort({ name: 1 });
      
      return restaurants;
    } catch (error) {
      throw new Error(`Error fetching restaurants by cuisine: ${error.message}`);
    }
  },

  /**
   * Get restaurants by city
   * @param {string} city - City name
   * @returns {Promise<Array>} - Array of restaurants
   */
  async getRestaurantsByCity(city) {
    try {
      const restaurants = await Restaurant.find({ 
        'address.city': { $regex: city, $options: 'i' }
      }).sort({ name: 1 });
      
      return restaurants;
    } catch (error) {
      throw new Error(`Error fetching restaurants by city: ${error.message}`);
    }
  }
};

module.exports = restaurantService; 
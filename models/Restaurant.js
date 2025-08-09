const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Restaurant name is required'],
    trim: true,
    maxLength: [100, 'Restaurant name cannot exceed 100 characters']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    zipCode: {
      type: String,
      required: [true, 'Zip code is required'],
      trim: true
    },
    borough: {
      type: String,
      trim: true
    }
  },
  // Adding a separate borough field for easier filtering
  borough: {
    type: String,
    trim: true
  },
  cuisine: {
    type: String,
    required: [true, 'Cuisine type is required'],
    trim: true,
    enum: ['Italian', 'Chinese', 'Mexican', 'Indian', 'American', 'French', 'Japanese', 'Thai', 'Mediterranean', 'Other']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
    match: [/^\(\d{3}\)\s\d{3}-\d{4}$/, 'Phone number must be in format (XXX) XXX-XXXX']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.+/, 'Website must be a valid URL starting with http:// or https://']
  },
  rating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    default: 1
  },
  priceRange: {
    type: String,
    enum: ['$', '$$', '$$$', '$$$$'],
    default: '$$'
  },
  hours: {
    monday: { type: String, default: 'Closed' },
    tuesday: { type: String, default: 'Closed' },
    wednesday: { type: String, default: 'Closed' },
    thursday: { type: String, default: 'Closed' },
    friday: { type: String, default: 'Closed' },
    saturday: { type: String, default: 'Closed' },
    sunday: { type: String, default: 'Closed' }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full address
restaurantSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} ${this.address.zipCode}`;
});

// Index for searching and sorting
restaurantSchema.index({ _id: 1 }); // For restaurant_id sorting
restaurantSchema.index({ name: 'text', 'address.city': 'text', cuisine: 'text' });
restaurantSchema.index({ borough: 1 }); // For borough filtering
restaurantSchema.index({ 'address.borough': 1 }); // For address.borough filtering

// Export with explicit collection name 'restaurant'
module.exports = mongoose.model('Restaurant', restaurantSchema, 'restaurant'); 
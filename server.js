const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./modules/db');
const restaurantRoutes = require('./routes/restaurants');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/restaurants', restaurantRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: db.isConnected() ? 'connected' : 'disconnected'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant Web API',
    version: '1.0.0',
    endpoints: {
      restaurants: '/api/restaurants',
      health: '/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Restaurant Web API...');
    
    // Get MongoDB connection string from environment
    const connectionString = process.env.MONGODB_URI;
    
    if (!connectionString) {
      throw new Error('MONGODB_URI environment variable is required. Please check your .env file.');
    }

    console.log('📡 Initializing database connection...');
    
    // Initialize database connection - server only starts if this succeeds
    await db.initialize(connectionString);
    
    console.log('✅ Database initialized successfully');
    
    // Start the server only after successful database connection
    app.listen(PORT, () => {
      console.log(`🌟 Server is running on port ${PORT}`);
      console.log(`🔗 API Base URL: http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      console.log(`🍽️  Restaurants API: http://localhost:${PORT}/api/restaurants`);
      console.log('📚 Available endpoints:');
      console.log('   GET    /api/restaurants       - Get all restaurants');
      console.log('   GET    /api/restaurants/:id   - Get restaurant by ID');
      console.log('   POST   /api/restaurants       - Create new restaurant');
      console.log('   PUT    /api/restaurants/:id   - Update restaurant');
      console.log('   DELETE /api/restaurants/:id   - Delete restaurant');
      console.log('   GET    /api/restaurants/cuisine/:cuisine - Get by cuisine');
      console.log('   GET    /api/restaurants/city/:city - Get by city');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('💡 Make sure to:');
    console.error('   1. Copy .env.example to .env');
    console.error('   2. Update MONGODB_URI with your MongoDB Atlas connection string');
    console.error('   3. Ensure your IP is whitelisted in MongoDB Atlas');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  try {
    await db.close();
    console.log('✅ Server shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  try {
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start the server
startServer(); 
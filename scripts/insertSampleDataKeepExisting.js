const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import the Restaurant model
const Restaurant = require('../models/Restaurant');

async function insertSampleData() {
  try {
    console.log('🚀 Starting sample data insertion...');
    
    // Get MongoDB connection string from environment
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error('❌ MONGODB_URI not found in .env file');
    }

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Read sample data file
    const sampleDataPath = path.join(__dirname, '..', 'sample-data.json');
    console.log(`📄 Reading sample data from: ${sampleDataPath}`);
    
    if (!fs.existsSync(sampleDataPath)) {
      throw new Error('❌ sample-data.json file not found');
    }

    const rawData = fs.readFileSync(sampleDataPath, 'utf8');
    const sampleData = JSON.parse(rawData);
    console.log(`📊 Found ${sampleData.length} restaurants to insert`);

    // Add required fields and timestamps
    const restaurantsToInsert = sampleData.map(restaurant => ({
      ...restaurant,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Optional: Clear existing data (uncomment if you want to replace all data)
    // console.log('🧹 Clearing existing restaurants...');
    // await Restaurant.deleteMany({});

    // Insert the restaurants
    console.log('📝 Inserting restaurants into database...');
    const insertedRestaurants = await Restaurant.insertMany(restaurantsToInsert);
    
    console.log('\n🎉 SUCCESS! Inserted restaurants:');
    insertedRestaurants.forEach((restaurant, index) => {
      console.log(`   ${index + 1}. ${restaurant.name} - ${restaurant.cuisine} cuisine`);
    });

    console.log(`\n📈 Total inserted: ${insertedRestaurants.length} restaurants`);
    
    // Show final database count
    const totalCount = await Restaurant.countDocuments();
    console.log(`📊 Total restaurants in database: ${totalCount}`);

  } catch (error) {
    console.error('\n❌ Error occurred:');
    console.error(error.message);
    
    if (error.code === 11000) {
      console.error('💡 Duplicate key error - some restaurants may already exist');
    }
    
    process.exit(1);
  } finally {
    // Always close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📡 Database connection closed');
    }
  }
}

// Execute the script
console.log('🍽️  Restaurant Sample Data Insertion Script');
console.log('==========================================');
insertSampleData();

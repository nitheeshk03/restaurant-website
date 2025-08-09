const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Restaurant = require('../models/Restaurant');

async function insertSampleDataReplace() {
  try {
    console.log('🚀 Starting sample data insertion (REPLACE MODE)...');
    console.log('⚠️  WARNING: This will delete all existing restaurants!');
    
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error('❌ MONGODB_URI not found in .env file');
    }

    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB Atlas');

    // Read sample data
    const sampleDataPath = path.join(__dirname, '..', 'sample-data.json');
    const rawData = fs.readFileSync(sampleDataPath, 'utf8');
    const sampleData = JSON.parse(rawData);

    // Show current count
    const currentCount = await Restaurant.countDocuments();
    console.log(`📊 Current restaurants in database: ${currentCount}`);

    // Clear all existing restaurants
    console.log('🧹 Deleting all existing restaurants...');
    const deleteResult = await Restaurant.deleteMany({});
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} restaurants`);

    // Prepare data for insertion
    const restaurantsToInsert = sampleData.map(restaurant => ({
      ...restaurant,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    // Insert new data
    console.log('📝 Inserting fresh sample data...');
    const insertedRestaurants = await Restaurant.insertMany(restaurantsToInsert);
    
    console.log('\n🎉 SUCCESS! Fresh database with sample restaurants:');
    insertedRestaurants.forEach((restaurant, index) => {
      console.log(`   ${index + 1}. ${restaurant.name} - ${restaurant.cuisine}`);
    });

    console.log(`\n📈 Database now contains: ${insertedRestaurants.length} restaurants`);

  } catch (error) {
    console.error('\n❌ Error occurred:', error.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('📡 Database connection closed');
    }
  }
}

console.log('🍽️  Restaurant Sample Data Replacement Script');
console.log('============================================');
insertSampleDataReplace();

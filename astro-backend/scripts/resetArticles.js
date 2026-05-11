// Quick script to drop the articles collection and start fresh
require('dotenv').config();
const mongoose = require('mongoose');

async function resetArticles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Drop the articles collection
    await mongoose.connection.db.dropCollection('articles');
    console.log('✅ Dropped articles collection');
    
    console.log('✅ Database reset complete. You can now run /api/news/fetch');
    process.exit(0);
  } catch (err) {
    if (err.message.includes('ns not found')) {
      console.log('⚠️  Collection does not exist yet. Nothing to drop.');
    } else {
      console.error('❌ Error:', err.message);
    }
    process.exit(1);
  }
}

resetArticles();

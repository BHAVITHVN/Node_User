const mongoose = require('mongoose');
require('dotenv').config();


const connectMongoDB = async () => {
  const uri = process.env.MONGO_URI; // Replace with your MongoDB URI
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true, // Automatically build indexes
    });
    console.log('Connected to MongoDB successfully.');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
  }
};

module.exports = connectMongoDB;

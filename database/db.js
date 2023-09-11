const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB is connected ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`Mongo error`, error.message);
  }
};

module.exports = connectDB;
const mongoose = require('mongoose');

const uri = "mongodb://admin:password123@localhost:27017/rueda-verde?authSource=admin";

mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const mongoose = require('mongoose');
module.exports = async function connectDB() {
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅  MongoDB: ${conn.connection.host}`);
};

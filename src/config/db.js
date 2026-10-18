const mongoose = require("mongoose");

/**
 * Connect to MongoDB database
 */
async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri || mongoUri.trim() === "") {
    console.warn(
      "⚠️  [Database Warning] MONGO_URI is not set in your .env file yet. Running server without database connection.",
    );
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ [MongoDB Connected] Host: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ [MongoDB Connection Error]: ${error?.message || error}`);
  }
}

module.exports = { connectDB };

const cron = require("node-cron");
const mongoose = require("mongoose");
const axios = require("axios");

// MongoDB & Server Keep-Alive Cron Job
// Runs once every 2 days (at 00:00 midnight every 2 days).
// Performs a MongoDB query/ping to keep the database active and prevent
// MongoDB Atlas free clusters from pausing due to inactivity.
function setupKeepAliveCron() {
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;

  // Runs once every 2 days at midnight: '0 0 */2 * *'
  cron.schedule("0 0 */2 * *", async () => {
    console.log(`[Keep-Alive Cron] Running 2-day keep-alive check at ${new Date().toISOString()}...`);

    // 1. Keep MongoDB Atlas Cluster Active via db ping / collection check
    try {
      if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
        await mongoose.connection.db.admin().ping();
        console.log("✅ [Keep-Alive Cron] MongoDB connection pinged successfully (Cluster kept active).");
      } else {
        console.warn("⚠️ [Keep-Alive Cron] MongoDB is not connected yet, skipping DB ping.");
      }
    } catch (dbErr) {
      console.error(`❌ [Keep-Alive Cron] MongoDB ping error: ${dbErr?.message || dbErr}`);
    }

    // 2. Ping Backend Server / API endpoint
    try {
      const response = await axios.get(backendUrl);
      console.log(`📡 [Keep-Alive Cron] Pinged ${backendUrl} successfully (Status: ${response.status})`);
    } catch (apiErr) {
      console.warn(`⚠️ [Keep-Alive Cron] Ping to ${backendUrl} failed: ${apiErr?.message || apiErr}`);
    }
  });

  console.log("[Keep-Alive Cron] Scheduled to run once every 2 days to keep MongoDB URI active.");
}

module.exports = { setupKeepAliveCron };

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { connectDB } = require("./config/db");
const { setupKeepAliveCron } = require("./cron/keepAlive");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allowed Origins (Localhost + Production Frontend)
const allowedOrigins = ["http://localhost:3000", process.env.CLIENT_URL].filter(
  Boolean,
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or keep-alive cron)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for initial setup and preview deployments
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authRoutes = require("./routes/authRoutes");

/**
 * Root test endpoint ('/')
 * Serves as a health-check and verification endpoint.
 * Also used by the keep-alive cron job to keep the server awake.
 */
app.get("/", (_req, res) => {
  res.status(200).json({
    status: "online",
    message: "Portfolio Backend API is running successfully!",
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
  });
});

/**
 * Health & Keep-Alive Ping Endpoint ('/api/health/ping')
 * Queries the first user ID to ensure an active read operation on MongoDB,
 * keeping both Render and MongoDB Atlas cluster awake and alive forever.
 */
const User = require("./models/User");
app.get("/api/health/ping", async (_req, res) => {
  try {
    // Ultra-lightweight query: only fetches the _id of 1 user (< 20 bytes)
    const sampleUser = await User.findOne().select("_id email").lean();
    return res.status(200).json({
      status: "alive",
      message: "Render server and MongoDB database are active.",
      dbConnected: true,
      userFound: Boolean(sampleUser),
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    });
  } catch (error) {
    console.error("Health ping error:", error);
    return res.status(500).json({
      status: "error",
      message: "Database ping failed.",
      error: error.message,
    });
  }
});

// Authentication Routes
app.use("/api/auth", authRoutes);

// Portfolio Dynamic Sections Routes
const sectionRoutes = require("./routes/sectionRoutes");
app.use("/api/sections", sectionRoutes);

// Media Upload & Cloudinary Asset Management Routes
const mediaRoutes = require("./routes/mediaRoutes");
app.use("/api/media", mediaRoutes);

// Global Error Handler Middleware
app.use((err, _req, res, _next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error occurred.",
  });
});


// Start Server
async function startServer() {
  // Connect to Database (reads MONGO_URI from .env)
  await connectDB();

  // Initialize Keep-Alive Cron Job
  setupKeepAliveCron();

  app.listen(PORT, () => {
    console.log(
      `🚀 [Server Running] Port: ${PORT} (Environment: ${process.env.NODE_ENV || "development"})`,
    );
    console.log(`📡 [Health Check]: http://localhost:${PORT}/`);
  });
}

startServer();

const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
} = require("../controllers/authController");
const { protect, authorize } = require("../middleware/auth");

// Public endpoints
router.post("/signup", signup);
router.post("/login", login);

// Protected endpoint
router.get("/me", protect, getMe);

// Admin-only User Management Endpoints
router.get("/users", protect, authorize("admin"), getAllUsers);
router.put("/users/:id", protect, authorize("admin"), updateUser);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

module.exports = router;

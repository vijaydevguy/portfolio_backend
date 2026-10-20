const express = require("express");
const router = express.Router();
const {
  getCommonSettings,
  updateCommonSettings,
} = require("../controllers/settingsController");
const { protect, authorize } = require("../middleware/auth");

// Public route to fetch common settings (cal.com, phone, email, whatsapp)
router.get("/common", getCommonSettings);

// Admin-only route to update common settings
router.put("/common", protect, authorize("admin"), updateCommonSettings);

module.exports = router;

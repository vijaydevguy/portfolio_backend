const express = require("express");
const router = express.Router();
const { getHeroSection, updateHeroSection } = require("../controllers/sectionController");
const { protect, authorize } = require("../middleware/auth");

// Public route to get navbar & hero details
router.get("/hero", getHeroSection);

// Admin-only route to update navbar & hero details
router.put("/hero", protect, authorize("admin"), updateHeroSection);

module.exports = router;

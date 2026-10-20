const express = require("express");
const router = express.Router();
const {
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
} = require("../controllers/contactController");
const { protect, authorize } = require("../middleware/auth");

// Public endpoint for submitting from the Contact section form
router.post("/", submitContactMessage);

// Admin-only endpoints for viewing and managing inquiries
router.get("/admin/all", protect, authorize("admin"), getContactMessages);
router.put("/:id", protect, authorize("admin"), updateContactMessage);
router.delete("/:id", protect, authorize("admin"), deleteContactMessage);

module.exports = router;

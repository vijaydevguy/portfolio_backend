const express = require("express");
const router = express.Router();
const {
  getPublicExperiences,
  getAdminExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  updateEducation,
  createEducationItem,
  updateEducationItem,
  deleteEducationItem,
} = require("../controllers/experienceController");
const { protect, authorize } = require("../middleware/auth");

// Public route for landing page timeline & education card
router.get("/", getPublicExperiences);

// Admin-only management endpoints
router.get("/admin/all", protect, authorize("admin"), getAdminExperiences);
router.put("/admin/reorder", protect, authorize("admin"), reorderExperiences);

// Education management endpoints (support single and multiple)
router.put("/education", protect, authorize("admin"), updateEducation);
router.post("/education", protect, authorize("admin"), createEducationItem);
router.put("/education/:id", protect, authorize("admin"), updateEducationItem);
router.delete("/education/:id", protect, authorize("admin"), deleteEducationItem);

// Experience CRUD endpoints
router.post("/", protect, authorize("admin"), createExperience);
router.put("/:id", protect, authorize("admin"), updateExperience);
router.delete("/:id", protect, authorize("admin"), deleteExperience);

module.exports = router;

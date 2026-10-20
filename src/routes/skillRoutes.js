const express = require("express");
const router = express.Router();
const {
  getSkills,
  getAdminSkills,
  createSkill,
  createSkillsBulk,
  updateSkill,
  deleteSkill,
  reorderSkills,
} = require("../controllers/skillController");
const { protect, authorize } = require("../middleware/auth");

// Public route
router.get("/", getSkills);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAdminSkills);
router.put("/admin/reorder", protect, authorize("admin"), reorderSkills);
router.post("/bulk", protect, authorize("admin"), createSkillsBulk);
router.post("/", protect, authorize("admin"), createSkill);
router.put("/:id", protect, authorize("admin"), updateSkill);
router.delete("/:id", protect, authorize("admin"), deleteSkill);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  getProjectOptions,
  createProjectOption,
  updateProjectOption,
  deleteProjectOption,
  reorderProjectOptions,
} = require("../controllers/projectOptionController");
const { protect } = require("../middleware/auth");

// Public route to fetch dropdown options
router.get("/", getProjectOptions);

// Admin routes for CRUD & Reordering
router.put("/reorder", protect, reorderProjectOptions);
router.post("/", protect, createProjectOption);
router.put("/:id", protect, updateProjectOption);
router.delete("/:id", protect, deleteProjectOption);

module.exports = router;

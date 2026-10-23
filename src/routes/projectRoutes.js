const express = require("express");
const router = express.Router();
const {
  getProjects,
  getAdminProjects,
  getProjectById,
  getProjectBySlug,
  createProject,
  updateProject,
  deleteProject,
  reorderProjects,
  toggleHomeFeatured,
} = require("../controllers/projectController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../middleware/upload");

// Public routes
router.get("/", getProjects);
router.get("/detail/:slug", getProjectBySlug);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAdminProjects);
router.get("/admin/single/:id", protect, authorize("admin"), getProjectById);
router.put("/admin/reorder", protect, authorize("admin"), reorderProjects);
router.put("/admin/toggle-home/:id", protect, authorize("admin"), toggleHomeFeatured);
router.post("/", protect, authorize("admin"), upload.array("files", 10), createProject);
router.put("/:id", protect, authorize("admin"), upload.array("files", 10), updateProject);
router.delete("/:id", protect, authorize("admin"), deleteProject);

module.exports = router;

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const {
  uploadMedia,
  uploadMediaBulk,
  getRecentAssets,
  deleteMediaAsset,
} = require("../controllers/mediaController");

// Upload file endpoint (requires authentication)
router.post("/upload", protect, upload.single("file"), uploadMedia);

// Upload multiple files endpoint (accepts any field name like 'files' or 'file' up to 50 files)
router.post("/upload-bulk", protect, upload.any(), uploadMediaBulk);

// Get recent assets for a section/category (up to 3)
router.get("/", protect, getRecentAssets);

// Delete a specific asset from Cloudinary & DB
router.delete("/:id", protect, deleteMediaAsset);

module.exports = router;

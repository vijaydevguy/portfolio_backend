const multer = require("multer");

// Use memory storage so file buffer can be uploaded directly to Cloudinary
const storage = multer.memoryStorage();

// File filter supporting common images and PDF documents
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Allowed formats: PNG, JPG, WebP, SVG, GIF, and PDF."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    // 10MB file size limit
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;

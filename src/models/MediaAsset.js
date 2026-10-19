const mongoose = require("mongoose");

/**
 * MediaAsset Schema
 * Tracks up to 3 assets per category per user to prevent running out of Cloudinary free tier.
 * When a 4th asset is uploaded to a category, the oldest one is deleted from Cloudinary & DB.
 */
const mediaAssetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      // e.g., 'navbar' | 'hero' | 'resume' | 'experience' | 'projects'
      index: true,
    },
    category: {
      type: String,
      required: true,
      // e.g., 'logo' | 'hero_image' | 'resume_pdf'
      index: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    // Short asset path relative to Cloudinary upload root (e.g. "v1792239302/logo_white_4x_gns8yk" or relative folder path)
    shortPath: {
      type: String,
      required: true,
    },
    // Full secure URL from Cloudinary
    secureUrl: {
      type: String,
      required: true,
    },
    // Original filename before upload
    originalName: {
      type: String,
      default: "",
    },
    // File format: pdf, png, jpg, webp, svg
    format: {
      type: String,
      default: "",
    },
    // Resource type: image | raw (for pdfs)
    resourceType: {
      type: String,
      default: "image",
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast queries when fetching or limiting assets per user & category
mediaAssetSchema.index({ userId: 1, section: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model("MediaAsset", mediaAssetSchema);

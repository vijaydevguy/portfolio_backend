const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema(
  {
    // Navbar settings
    logoText: {
      type: String,
      default: "Vijay Kumar",
    },
    logoUrl: {
      type: String,
      default: "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1773030225/portfolio_app/logo_black.webp",
    },

    // Hero Section Content
    titlePrefix: {
      type: String,
      default: "Software",
    },
    titleHighlight: {
      type: String,
      default: "Developer",
    },
    subtitle: {
      type: String,
      default: "Crafting scalable, high-performance web applications and intuitive digital experiences.",
    },
    heroImageUrl: {
      type: String,
      default: "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1773030225/portfolio_app/hero_img.webp",
    },

    // Resume Links (max 3 as per project rules)
    resumes: [
      {
        label: { type: String, default: "Download Resume" },
        url: {
          type: String,
          default: "https://drive.google.com/uc?export=download&id=1QfIBC0J_QRX4MRoycDwEdD3xBt2kKSpE",
        },
        isPrimary: { type: Boolean, default: true },
      },
    ],

    // Secondary CTA
    ctaContactText: {
      type: String,
      default: "Get in Touch",
    },
    ctaContactHref: {
      type: String,
      default: "#contact",
    },

    // Visibility toggle
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure there is at most one active Hero document (Singleton pattern for site settings)
module.exports = mongoose.model("HeroSection", heroSectionSchema);

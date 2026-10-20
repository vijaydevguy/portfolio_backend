const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Project slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    category: {
      type: String,
      enum: ["Development", "UI / UX Design"],
      default: "Development",
    },
    projectType: {
      type: String,
      enum: ["Professional", "Personal"],
      default: "Personal",
    },
    shortDescription: {
      type: String,
      required: [true, "Short description is required"],
      trim: true,
    },
    technologies: {
      type: [String],
      default: [],
    },
    previewImages: {
      type: [String],
      default: [],
    },
    hasDetailPage: {
      type: Boolean,
      default: true,
    },
    liveUrl: {
      type: String,
      trim: true,
      default: "",
    },
    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },
    overview: {
      type: String,
      trim: true,
      default: "",
    },
    keyFeatures: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    role: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
    isFeaturedOnHome: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Project", projectSchema);

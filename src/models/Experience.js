const mongoose = require("mongoose");

const ExperienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role/Designation is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    type: {
      type: String,
      default: "Full-time",
      trim: true,
    },
    period: {
      type: String,
      trim: true,
      default: "",
    },
    duration: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: mongoose.Schema.Types.Mixed,
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isVisible: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Experience", ExperienceSchema);

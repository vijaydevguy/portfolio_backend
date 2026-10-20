const mongoose = require("mongoose");

const EducationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      default: "B.E.",
      trim: true,
    },
    field: {
      type: String,
      default: "Computer Science Engineering",
      trim: true,
    },
    institution: {
      type: String,
      default: "Thirumalai Engineering College (Anna University)",
      trim: true,
    },
    location: {
      type: String,
      default: "Kanchipuram, Tamil Nadu",
      trim: true,
    },
    graduated: {
      type: String,
      default: "June 2023",
      trim: true,
    },
    score: {
      type: String,
      default: "CGPA: 7.89",
      trim: true,
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

module.exports = mongoose.model("Education", EducationSchema);

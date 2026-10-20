const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Skill name / title is required"],
      trim: true,
    },
    category: {
      type: String,
      default: "Frontend",
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Skill icon/image URL is required"],
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

module.exports = mongoose.model("Skill", SkillSchema);

const mongoose = require("mongoose");

const projectOptionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["category", "projectType"],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Option name is required"],
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Unique compound index on type + lowercase name
projectOptionSchema.index({ type: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("ProjectOption", projectOptionSchema);

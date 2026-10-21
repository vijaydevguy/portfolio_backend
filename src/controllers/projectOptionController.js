const ProjectOption = require("../models/ProjectOption");

const DEFAULT_OPTIONS = [
  // Categories
  { type: "category", name: "Development", order: 1, isDefault: true },
  { type: "category", name: "UI / UX Design", order: 2, isDefault: false },
  // Project Types
  { type: "projectType", name: "Professional", order: 1, isDefault: false },
  { type: "projectType", name: "Personal", order: 2, isDefault: true },
];

/**
 * Seed default options if collection is empty
 */
const seedOptionsIfEmpty = async () => {
  const count = await ProjectOption.countDocuments();
  if (count === 0) {
    await ProjectOption.insertMany(DEFAULT_OPTIONS);
  }
};

/**
 * @desc    Get all project options (or filter by ?type=category / ?type=projectType)
 * @route   GET /api/project-options
 * @access  Public
 */
const getProjectOptions = async (req, res) => {
  try {
    await seedOptionsIfEmpty();

    const { type } = req.query;
    const filter = {};
    if (type && ["category", "projectType"].includes(type)) {
      filter.type = type;
    }

    const options = await ProjectOption.find(filter)
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: options,
      categories: options.filter((o) => o.type === "category"),
      projectTypes: options.filter((o) => o.type === "projectType"),
    });
  } catch (error) {
    console.error("getProjectOptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch project options",
      error: error.message,
    });
  }
};

/**
 * @desc    Create a new project option
 * @route   POST /api/project-options
 * @access  Private (Admin only)
 */
const createProjectOption = async (req, res) => {
  try {
    const { type, name, order } = req.body;

    if (!type || !["category", "projectType"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid type. Must be 'category' or 'projectType'.",
      });
    }

    const trimmedName = (name || "").trim();
    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Option name cannot be empty.",
      });
    }

    // Check duplicate
    const existing = await ProjectOption.findOne({
      type,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: `A ${type === "category" ? "category" : "project type"} named "${trimmedName}" already exists.`,
      });
    }

    const count = await ProjectOption.countDocuments({ type });
    if (count >= 10) {
      return res.status(400).json({
        success: false,
        message: `Maximum limit reached: You can add at most 10 ${type === "category" ? "categories" : "project types"}.`,
      });
    }

    const newOption = await ProjectOption.create({
      type,
      name: trimmedName,
      order: typeof order === "number" ? order : count + 1,
      isDefault: false,
    });

    return res.status(201).json({
      success: true,
      message: `${type === "category" ? "Category" : "Project type"} created successfully.`,
      data: newOption,
    });
  } catch (error) {
    console.error("createProjectOption error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project option",
      error: error.message,
    });
  }
};

/**
 * @desc    Update a project option
 * @route   PUT /api/project-options/:id
 * @access  Private (Admin only)
 */
const updateProjectOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    const option = await ProjectOption.findById(id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Project option not found.",
      });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (!trimmedName) {
        return res.status(400).json({
          success: false,
          message: "Option name cannot be empty.",
        });
      }

      // Check conflict with other items
      const conflict = await ProjectOption.findOne({
        _id: { $ne: id },
        type: option.type,
        name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
      });

      if (conflict) {
        return res.status(400).json({
          success: false,
          message: `Another ${option.type === "category" ? "category" : "project type"} with the name "${trimmedName}" already exists.`,
        });
      }

      option.name = trimmedName;
    }

    if (typeof order === "number") {
      option.order = order;
    }

    await option.save();

    return res.status(200).json({
      success: true,
      message: "Project option updated successfully.",
      data: option,
    });
  } catch (error) {
    console.error("updateProjectOption error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project option",
      error: error.message,
    });
  }
};

/**
 * @desc    Delete a project option
 * @route   DELETE /api/project-options/:id
 * @access  Private (Admin only)
 */
const deleteProjectOption = async (req, res) => {
  try {
    const { id } = req.params;

    const option = await ProjectOption.findById(id);
    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Project option not found.",
      });
    }

    // Ensure we don't delete the last option in this type
    const remainingCount = await ProjectOption.countDocuments({ type: option.type });
    if (remainingCount <= 1) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete the last remaining ${option.type === "category" ? "category" : "project type"}.`,
      });
    }

    await ProjectOption.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `${option.type === "category" ? "Category" : "Project type"} deleted successfully.`,
      data: { id },
    });
  } catch (error) {
    console.error("deleteProjectOption error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project option",
      error: error.message,
    });
  }
};

/**
 * @desc    Reorder project options (drag and drop)
 * @route   PUT /api/project-options/reorder
 * @access  Private (Admin only)
 */
const reorderProjectOptions = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid items format" });
    }

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { _id: item.id || item._id },
        update: { $set: { order: item.order } },
      },
    }));

    if (bulkOps.length > 0) {
      await ProjectOption.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      success: true,
      message: "Options reordered successfully",
    });
  } catch (error) {
    console.error("reorderProjectOptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder project options",
      error: error.message,
    });
  }
};

module.exports = {
  getProjectOptions,
  createProjectOption,
  updateProjectOption,
  deleteProjectOption,
  reorderProjectOptions,
};

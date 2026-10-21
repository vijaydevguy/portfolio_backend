const Skill = require("../models/Skill");
const { DEFAULT_SKILLS } = require("../data/defaultData");

// Helper to auto-seed default skills if collection is empty
const seedSkillsIfEmpty = async () => {
  const count = await Skill.countDocuments();
  if (count === 0 && Array.isArray(DEFAULT_SKILLS) && DEFAULT_SKILLS.length > 0) {
    await Skill.insertMany(DEFAULT_SKILLS);
  }
};

// @desc    Get all active skills for public portfolio
// @route   GET /api/skills
// @access  Public
const getSkills = async (req, res) => {
  try {
    await seedSkillsIfEmpty();
    const skills = await Skill.find({ isVisible: true }).sort({ order: 1, createdAt: 1 });
    return res.status(200).json({
      success: true,
      count: skills.length,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching skills",
      error: error.message,
    });
  }
};

// @desc    Get all skills for Admin with pagination and search
// @route   GET /api/skills/admin/all
// @access  Private/Admin
const getAdminSkills = async (req, res) => {
  try {
    await seedSkillsIfEmpty();
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || "").trim();

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Skill.countDocuments(query);
    const skills = await Skill.find(query)
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: skills,
    });
  } catch (error) {
    console.error("Error fetching admin skills:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching admin skills",
      error: error.message,
    });
  }
};

// @desc    Create a new Skill
// @route   POST /api/skills
// @access  Private/Admin
const createSkill = async (req, res) => {
  try {
    const { name, imageUrl, category, isVisible } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Skill title/name is required" });
    }
    if (!imageUrl || !imageUrl.trim()) {
      return res.status(400).json({ success: false, message: "Skill image is required" });
    }

    // Determine default order: place at end
    const lastSkill = await Skill.findOne().sort({ order: -1 }).select("order");
    const newOrder = lastSkill && typeof lastSkill.order === "number" ? lastSkill.order + 1 : 0;

    const skill = await Skill.create({
      name: name.trim(),
      imageUrl: imageUrl.trim(),
      category: category ? category.trim() : "Frontend",
      isVisible: isVisible !== false,
      order: newOrder,
    });

    return res.status(201).json({
      success: true,
      message: "Skill added successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error creating skill:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating skill",
      error: error.message,
    });
  }
};

// @desc    Update an existing Skill
// @route   PUT /api/skills/:id
// @access  Private/Admin
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, imageUrl, category, isVisible, order } = req.body;

    const skill = await Skill.findById(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    if (name !== undefined) skill.name = name.trim();
    if (imageUrl !== undefined) skill.imageUrl = imageUrl.trim();
    if (category !== undefined) skill.category = category.trim();
    if (isVisible !== undefined) skill.isVisible = isVisible;
    if (order !== undefined) skill.order = Number(order);

    await skill.save();

    return res.status(200).json({
      success: true,
      message: "Skill updated successfully",
      data: skill,
    });
  } catch (error) {
    console.error("Error updating skill:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating skill",
      error: error.message,
    });
  }
};

// @desc    Delete a Skill
// @route   DELETE /api/skills/:id
// @access  Private/Admin
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) {
      return res.status(404).json({ success: false, message: "Skill not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting skill:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting skill",
      error: error.message,
    });
  }
};

// @desc    Reorder Skills (Drag & Drop in Table)
// @route   PUT /api/skills/admin/reorder
// @access  Private/Admin
const reorderSkills = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({ success: false, message: "orderedIds array is required" });
    }

    const bulkOps = orderedIds.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index } },
      },
    }));

    await Skill.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Skills order updated successfully",
    });
  } catch (error) {
    console.error("Error reordering skills:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reorder skills",
      error: error.message,
    });
  }
};

// @desc    Bulk Create Skills (from bulk image upload)
// @route   POST /api/skills/bulk
// @access  Private/Admin
const createSkillsBulk = async (req, res) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ success: false, message: "skills array is required" });
    }

    // Determine starting order
    const lastSkill = await Skill.findOne().sort({ order: -1 }).select("order");
    let currentOrder = lastSkill && typeof lastSkill.order === "number" ? lastSkill.order + 1 : 0;

    const skillDocs = skills
      .filter((s) => s.name && s.imageUrl)
      .map((s, idx) => ({
        name: s.name.trim(),
        imageUrl: s.imageUrl.trim(),
        category: s.category ? s.category.trim() : "Frontend",
        isVisible: s.isVisible !== false,
        order: currentOrder + idx,
      }));

    if (skillDocs.length === 0) {
      return res.status(400).json({ success: false, message: "No valid skills with name and imageUrl provided" });
    }

    const inserted = await Skill.insertMany(skillDocs);

    return res.status(201).json({
      success: true,
      message: `Successfully created ${inserted.length} skills in bulk!`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error("Error creating bulk skills:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating bulk skills",
      error: error.message,
    });
  }
};

module.exports = {
  getSkills,
  getAdminSkills,
  createSkill,
  createSkillsBulk,
  updateSkill,
  deleteSkill,
  reorderSkills,
};

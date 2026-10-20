const Experience = require("../models/Experience");
const Education = require("../models/Education");

// Seed data if collection is completely empty
const DEFAULT_EXPERIENCES = [
  {
    role: "Software Development Engineer (SDE)",
    company: "Best Labz",
    type: "Full-time",
    period: "Dec 2025 – Present",
    duration: "11 mos",
    location: "Remote / On-site",
    description: [
      "Building and maintaining full-stack web applications using React.js, Next.js, Node.js, and Express.js.",
      "Developing RESTful APIs with MongoDB and MySQL for multi-tenant SaaS workflows.",
      "Creating reusable, responsive UI components focused on performance and usability.",
    ],
    order: 1,
    isVisible: true,
  },
  {
    role: "Product / UI UX Designer & Frontend Developer",
    company: "Best Labz",
    type: "Full-time",
    period: "May 2024 – Nov 2025",
    duration: "1 yr 8 mos",
    location: "Remote",
    description: [
      "Designed user flows, wireframes, and UI prototypes in Figma.",
      "Developed responsive frontend components with React.js and Tailwind CSS.",
      "Bridged design and engineering to ensure interface consistency.",
    ],
    order: 2,
    isVisible: true,
  },
  {
    role: "Frontend Developer Intern",
    company: "Senchola Technologies",
    type: "Internship",
    period: "",
    duration: "",
    location: "",
    description: [
      "Built responsive web interfaces and strengthened core JavaScript and React fundamentals.",
      "Collaborated with senior engineers using Git version control and modern web practices.",
    ],
    order: 3,
    isVisible: true,
  },
];

const DEFAULT_EDUCATION = {
  degree: "B.E.",
  field: "Computer Science Engineering",
  institution: "Thirumalai Engineering College (Anna University)",
  location: "Kanchipuram, Tamil Nadu",
  graduated: "June 2023",
  score: "CGPA: 7.89",
  isVisible: true,
};

// @desc    Get all active experiences + education for public frontend
// @route   GET /api/experiences
// @access  Public
const getPublicExperiences = async (_req, res) => {
  try {
    let experiences = await Experience.find({ isVisible: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    // Auto-seed if database has 0 experiences
    if (experiences.length === 0) {
      const countTotal = await Experience.countDocuments();
      if (countTotal === 0) {
        await Experience.insertMany(DEFAULT_EXPERIENCES);
        experiences = await Experience.find({ isVisible: true })
          .sort({ order: 1, createdAt: 1 })
          .lean();
      }
    }

    let educations = await Education.find({ isVisible: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    if (educations.length === 0) {
      const countTotal = await Education.countDocuments();
      if (countTotal === 0) {
        await Education.create(DEFAULT_EDUCATION);
        educations = await Education.find({ isVisible: true })
          .sort({ order: 1, createdAt: 1 })
          .lean();
      }
    }

    return res.status(200).json({
      success: true,
      experiences,
      education: educations[0] || null,
      educations,
    });
  } catch (error) {
    console.error("Error fetching public experiences:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching experiences",
      error: error.message,
    });
  }
};

// @desc    Get all experiences for Admin with pagination and search
// @route   GET /api/experiences/admin/all
// @access  Private/Admin
const getAdminExperiences = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || "").trim();

    const query = {};
    if (search) {
      query.$or = [
        { role: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    // Auto seed if empty
    const totalCount = await Experience.countDocuments();
    if (totalCount === 0) {
      await Experience.insertMany(DEFAULT_EXPERIENCES);
    }

    const total = await Experience.countDocuments(query);
    const experiences = await Experience.find(query)
      .sort({ order: 1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    let educations = await Education.find()
      .sort({ order: 1, createdAt: 1 })
      .lean();

    if (educations.length === 0) {
      await Education.create(DEFAULT_EDUCATION);
      educations = await Education.find()
        .sort({ order: 1, createdAt: 1 })
        .lean();
    }

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      experiences,
      education: educations[0] || null,
      educations,
    });
  } catch (error) {
    console.error("Error fetching admin experiences:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching admin experiences",
      error: error.message,
    });
  }
};

// @desc    Create a new Work Experience item
// @route   POST /api/experiences
// @access  Private/Admin
const createExperience = async (req, res) => {
  try {
    const { role, company, type, period, duration, location, description, isVisible } = req.body;

    if (!role || !company) {
      return res.status(400).json({
        success: false,
        message: "Role and Company are required.",
      });
    }

    // Determine next order
    const last = await Experience.findOne().sort({ order: -1 });
    const nextOrder = last && typeof last.order === "number" ? last.order + 1 : 1;

    let points = "";
    if (typeof description === "string") {
      points = description.trim();
    } else if (Array.isArray(description)) {
      points = description.map((d) => String(d).trim()).filter(Boolean);
    }

    const newExp = await Experience.create({
      role: role.trim(),
      company: company.trim(),
      type: (type || "Full-time").trim(),
      period: period ? period.trim() : "",
      duration: duration ? duration.trim() : "",
      location: location ? location.trim() : "",
      description: points,
      order: nextOrder,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Experience created successfully.",
      data: newExp,
    });
  } catch (error) {
    console.error("Error creating experience:", error);
    return res.status(500).json({
      success: false,
      message: "Server error creating experience",
      error: error.message,
    });
  }
};

// @desc    Update a Work Experience item
// @route   PUT /api/experiences/:id
// @access  Private/Admin
const updateExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, company, type, period, duration, location, description, isVisible, order } =
      req.body;

    const exp = await Experience.findById(id);
    if (!exp) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    if (role !== undefined) exp.role = role.trim();
    if (company !== undefined) exp.company = company.trim();
    if (type !== undefined) exp.type = type.trim();
    if (period !== undefined) exp.period = period.trim();
    if (duration !== undefined) exp.duration = duration.trim();
    if (location !== undefined) exp.location = location.trim();
    if (isVisible !== undefined) exp.isVisible = Boolean(isVisible);
    if (order !== undefined) exp.order = Number(order);

    if (description !== undefined) {
      if (typeof description === "string") {
        exp.description = description.trim();
      } else if (Array.isArray(description)) {
        exp.description = description.map((d) => String(d).trim()).filter(Boolean);
      }
    }

    await exp.save();

    return res.status(200).json({
      success: true,
      message: "Experience updated successfully.",
      data: exp,
    });
  } catch (error) {
    console.error("Error updating experience:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating experience",
      error: error.message,
    });
  }
};

// @desc    Delete a Work Experience item
// @route   DELETE /api/experiences/:id
// @access  Private/Admin
const deleteExperience = async (req, res) => {
  try {
    const { id } = req.params;
    const exp = await Experience.findByIdAndDelete(id);
    if (!exp) {
      return res.status(404).json({ success: false, message: "Experience not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Experience deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting experience:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting experience",
      error: error.message,
    });
  }
};

// @desc    Reorder Work Experiences
// @route   PUT /api/experiences/admin/reorder
// @access  Private/Admin
const reorderExperiences = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "orderedIds array is required",
      });
    }

    const updates = orderedIds.map((id, index) =>
      Experience.findByIdAndUpdate(id, { order: index + 1 })
    );
    await Promise.all(updates);

    return res.status(200).json({
      success: true,
      message: "Experience order persisted successfully",
    });
  } catch (error) {
    console.error("Error reordering experiences:", error);
    return res.status(500).json({
      success: false,
      message: "Server error reordering experiences",
      error: error.message,
    });
  }
};

// @desc    Update single default Education details (legacy support)
// @route   PUT /api/experiences/education
// @access  Private/Admin
const updateEducation = async (req, res) => {
  try {
    const { degree, field, institution, location, graduated, score, isVisible, _id } = req.body;

    let edu;
    if (_id) {
      edu = await Education.findById(_id);
    } else {
      edu = await Education.findOne();
    }

    if (!edu) {
      edu = new Education(DEFAULT_EDUCATION);
    }

    if (degree !== undefined) edu.degree = degree.trim();
    if (field !== undefined) edu.field = field.trim();
    if (institution !== undefined) edu.institution = institution.trim();
    if (location !== undefined) edu.location = location.trim();
    if (graduated !== undefined) edu.graduated = graduated.trim();
    if (score !== undefined) edu.score = score.trim();
    if (isVisible !== undefined) edu.isVisible = Boolean(isVisible);

    await edu.save();

    return res.status(200).json({
      success: true,
      message: "Education details updated successfully.",
      data: edu,
    });
  } catch (error) {
    console.error("Error updating education:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating education",
      error: error.message,
    });
  }
};

// @desc    Create a new Education item
// @route   POST /api/experiences/education
// @access  Private/Admin
const createEducationItem = async (req, res) => {
  try {
    const { degree, field, institution, location, graduated, score, isVisible } = req.body;

    if (!degree || !institution) {
      return res.status(400).json({
        success: false,
        message: "Degree and Institution are required.",
      });
    }

    const last = await Education.findOne().sort({ order: -1 });
    const nextOrder = last && typeof last.order === "number" ? last.order + 1 : 1;

    const newEdu = await Education.create({
      degree: degree.trim(),
      field: (field || "").trim(),
      institution: institution.trim(),
      location: (location || "").trim(),
      graduated: (graduated || "").trim(),
      score: (score || "").trim(),
      order: nextOrder,
      isVisible: isVisible !== undefined ? Boolean(isVisible) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Education added successfully.",
      data: newEdu,
    });
  } catch (error) {
    console.error("Error creating education:", error);
    return res.status(500).json({
      success: false,
      message: "Server error adding education",
      error: error.message,
    });
  }
};

// @desc    Update an Education item by ID
// @route   PUT /api/experiences/education/:id
// @access  Private/Admin
const updateEducationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, field, institution, location, graduated, score, isVisible } = req.body;

    const edu = await Education.findById(id);
    if (!edu) {
      return res.status(404).json({ success: false, message: "Education record not found" });
    }

    if (degree !== undefined) edu.degree = degree.trim();
    if (field !== undefined) edu.field = field.trim();
    if (institution !== undefined) edu.institution = institution.trim();
    if (location !== undefined) edu.location = location.trim();
    if (graduated !== undefined) edu.graduated = graduated.trim();
    if (score !== undefined) edu.score = score.trim();
    if (isVisible !== undefined) edu.isVisible = Boolean(isVisible);

    await edu.save();

    return res.status(200).json({
      success: true,
      message: "Education updated successfully.",
      data: edu,
    });
  } catch (error) {
    console.error("Error updating education item:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating education",
      error: error.message,
    });
  }
};

// @desc    Delete an Education item by ID
// @route   DELETE /api/experiences/education/:id
// @access  Private/Admin
const deleteEducationItem = async (req, res) => {
  try {
    const { id } = req.params;
    const edu = await Education.findByIdAndDelete(id);
    if (!edu) {
      return res.status(404).json({ success: false, message: "Education record not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Education deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting education item:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting education",
      error: error.message,
    });
  }
};

module.exports = {
  getPublicExperiences,
  getAdminExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperiences,
  updateEducation,
  createEducationItem,
  updateEducationItem,
  deleteEducationItem,
};

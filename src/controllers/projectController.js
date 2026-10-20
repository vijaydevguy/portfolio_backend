const Project = require("../models/Project");

const SEED_PROJECTS = [
  {
    title: "Multi-Tenant E-Commerce & POS SaaS",
    slug: "multi-tenant-ecommerce-pos",
    category: "Development",
    projectType: "Professional",
    shortDescription:
      "Enterprise platform managing Master Admin, multi-vendor Tenant stores, and customer storefronts with real-time POS billing.",
    technologies: ["React.js", "Redux", "Node.js", "MongoDB"],
    previewImages: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80",
    ],
    hasDetailPage: true,
    overview:
      "A comprehensive multi-tenant architecture designed to scale merchant stores with role-based access, automated inventory sync, and localized POS billing checkout workflows.",
    keyFeatures: [
      "Role-Based Access Control (RBAC) across Master Admin and Store Tenants",
      "Dynamic product catalog and category hierarchy management",
      "Order lifecycle tracking, customer management, and invoice generation",
      "Multi-store subscription plan gating and billing analytics",
    ],
    role: "Full Stack SDE • Best Labz",
    order: 1,
    isVisible: true,
    isFeaturedOnHome: true,
  },
  {
    title: "Hefgro SaaS Platform",
    slug: "hefgro-saas-landing",
    category: "Development",
    projectType: "Professional",
    shortDescription:
      "High-conversion, responsive SaaS interface showcasing smart inventory, procurement, and factory operation workflows.",
    technologies: ["Next.js", "Tailwind CSS", "React.js", "Figma"],
    previewImages: [
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80",
    ],
    hasDetailPage: true,
    liveUrl: "https://www.hefgro.com/",
    overview:
      "Engineered a polished, responsive digital presence for an industrial operations SaaS, emphasizing interactive module previews, rapid loading times, and intuitive typography.",
    keyFeatures: [
      "Interactive feature showcases and workflow diagrams",
      "Optimized Core Web Vitals with seamless responsive scaling",
      "Clean UI component design system aligned with industrial software branding",
    ],
    role: "Frontend Developer • Best Labz",
    order: 2,
    isVisible: true,
    isFeaturedOnHome: true,
  },
  {
    title: "Full Stack E-Commerce Platform",
    slug: "fullstack-mern-ecommerce",
    category: "Development",
    projectType: "Personal",
    shortDescription:
      "Complete shopping platform featuring customer authentication, cart state management, checkout, and merchant admin panel.",
    technologies: ["MERN Stack", "Express.js", "MongoDB", "Tailwind"],
    previewImages: [
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80",
    ],
    hasDetailPage: true,
    liveUrl: "https://ecommerce-frontend-five-orpin.vercel.app/",
    overview:
      "Production-ready e-commerce store with secure JWT user sessions, real-time cart mutations, catalog filtering, and comprehensive administrative dashboards.",
    keyFeatures: [
      "JWT-based user registration, authentication, and password security",
      "Persistent shopping cart with stock availability checks",
      "Admin portal for product uploads, order tracking, and sales analytics",
    ],
    role: "Independent Full Stack Project",
    order: 3,
    isVisible: true,
    isFeaturedOnHome: true,
  },
  {
    title: "Enterprise Design System & Prototypes",
    slug: "enterprise-uiux-systems",
    category: "UI / UX Design",
    projectType: "Professional",
    shortDescription:
      "Proprietary component libraries, wireframes, and design guidelines crafted for internal client enterprise suites.",
    technologies: ["Figma", "UI/UX", "Design Systems", "Prototyping"],
    previewImages: [
      "https://images.unsplash.com/photo-1581291518655-9523c93269c4?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80",
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
    ],
    hasDetailPage: false,
    overview:
      "Comprehensive design systems built in Figma specifying typography hierarchies, color accessibility tokens, and interactive micro-states.",
    role: "UI/UX Designer • Best Labz",
    order: 4,
    isVisible: true,
    isFeaturedOnHome: false,
  },
];

// Helper to seed projects if DB is empty
const seedProjectsIfEmpty = async () => {
  const count = await Project.countDocuments();
  if (count === 0) {
    await Project.insertMany(SEED_PROJECTS);
  }
};

// @desc    Get all public projects
// @route   GET /api/projects
// @access  Public
// @desc    Get public projects (Lightweight home or full list)
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    await seedProjectsIfEmpty();

    const isHome = req.query.home === "true";
    const query = { isVisible: true };

    if (isHome) {
      query.isFeaturedOnHome = true;
    } else if (req.query.category && req.query.category !== "All") {
      query.category = req.query.category;
    }

    // Case 6: Lightweight payload for landing page (only required keys)
    let projectQuery = Project.find(query).sort({ order: 1, createdAt: -1 });

    if (isHome) {
      projectQuery = projectQuery
        .select("title slug category projectType previewImages shortDescription liveUrl hasDetailPage order")
        .limit(3);
    }

    const projects = await projectQuery.lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (err) {
    console.error("Error in getProjects:", err);
    res.status(500).json({ success: false, message: "Server error fetching projects" });
  }
};

// @desc    Get all projects (with pagination & search) for Admin
// @route   GET /api/projects/admin/all
// @access  Private (Admin)
exports.getAdminProjects = async (req, res) => {
  try {
    await seedProjectsIfEmpty();

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search ? req.query.search.trim() : "";

    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Project.countDocuments(query);
    const projects = await Project.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: projects,
    });
  } catch (err) {
    console.error("Error in getAdminProjects:", err);
    res.status(500).json({ success: false, message: "Server error fetching admin projects" });
  }
};

// @desc    Reorder projects batch (drag and drop)
// @route   PUT /api/projects/admin/reorder
// @access  Private (Admin)
exports.reorderProjects = async (req, res) => {
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
      await Project.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: "Projects reordered successfully",
    });
  } catch (err) {
    console.error("Error in reorderProjects:", err);
    res.status(500).json({ success: false, message: "Failed to reorder projects" });
  }
};

// @desc    Toggle Home Page Feature flag with max 3 enforcement
// @route   PUT /api/projects/admin/toggle-home/:id
// @access  Private (Admin)
exports.toggleHomeFeatured = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    const willFeature = !project.isFeaturedOnHome;

    if (willFeature) {
      const featuredCount = await Project.countDocuments({ isFeaturedOnHome: true });
      if (featuredCount >= 3) {
        return res.status(400).json({
          success: false,
          message: "Maximum 3 projects can be featured on the Home Page. Please unselect one first.",
        });
      }
    }

    project.isFeaturedOnHome = willFeature;
    await project.save();

    res.status(200).json({
      success: true,
      message: willFeature ? "Project added to Home Page showcase" : "Project removed from Home Page",
      data: project,
    });
  } catch (err) {
    console.error("Error in toggleHomeFeatured:", err);
    res.status(500).json({ success: false, message: "Failed to toggle home feature" });
  }
};

// @desc    Get single project by slug
// @route   GET /api/projects/:slug
// @access  Public
exports.getProjectBySlug = async (req, res) => {
  try {
    await seedProjectsIfEmpty();
    const project = await Project.findOne({ slug: req.params.slug });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error("Error in getProjectBySlug:", err);
    res.status(500).json({ success: false, message: "Server error fetching project" });
  }
};

// @desc    Get single project by ID for Admin Edit
// @route   GET /api/projects/admin/single/:id
// @access  Private (Admin)
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (err) {
    console.error("Error in getProjectById:", err);
    res.status(500).json({ success: false, message: "Server error fetching project" });
  }
};

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
  try {
    const { title, slug } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: "Project title is required" });
    }

    // Generate slug if not provided
    const finalSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const existing = await Project.findOne({ slug: finalSlug });
    if (existing) {
      return res.status(400).json({ success: false, message: "A project with this slug already exists" });
    }

    const project = await Project.create({
      ...req.body,
      slug: finalSlug,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (err) {
    console.error("Error in createProject:", err);
    res.status(500).json({ success: false, message: err.message || "Server error creating project" });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res) => {
  try {
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check slug collision if slug is being updated
    if (req.body.slug && req.body.slug !== project.slug) {
      const existing = await Project.findOne({ slug: req.body.slug, _id: { $ne: project._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "A project with this slug already exists" });
      }
    }

    project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (err) {
    console.error("Error in updateProject:", err);
    res.status(500).json({ success: false, message: err.message || "Server error updating project" });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    await Project.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteProject:", err);
    res.status(500).json({ success: false, message: "Server error deleting project" });
  }
};

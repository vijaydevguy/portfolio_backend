const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");

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

// @desc    Get public projects (Lightweight home or paginated/filtered list)
// @route   GET /api/projects
// @access  Public
exports.getProjects = async (req, res) => {
  try {
    await seedProjectsIfEmpty();

    const isHome = req.query.home === "true";
    const query = { isVisible: true };

    if (isHome) {
      query.isFeaturedOnHome = true;
    } else {
      // 1. Category filter
      if (req.query.category && req.query.category !== "All") {
        query.category = req.query.category;
      }

      // 2. Project Type filter (e.g. Professional, Personal)
      if (req.query.projectType && req.query.projectType !== "All") {
        query.projectType = req.query.projectType;
      }

      // 3. Search query across title, shortDescription, role, technologies
      const search = req.query.search ? req.query.search.trim() : "";
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { shortDescription: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
          { technologies: { $elemMatch: { $regex: search, $options: "i" } } },
        ];
      }
    }

    // Base query sorted by order asc, then newest first
    let projectQuery = Project.find(query).sort({ order: 1, createdAt: -1 });

    if (isHome) {
      projectQuery = projectQuery
        .select("title slug category projectType previewImages shortDescription liveUrl hasDetailPage order")
        .limit(3);

      const projects = await projectQuery.lean();
      return res.status(200).json({
        success: true,
        count: projects.length,
        total: projects.length,
        data: projects,
      });
    }

    // Backend-level pagination if page or limit query parameters are provided
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const total = await Project.countDocuments(query);

    if (page && limit) {
      const skip = (page - 1) * limit;
      projectQuery = projectQuery.skip(skip).limit(limit);
    }

    const projects = await projectQuery.lean();

    res.status(200).json({
      success: true,
      count: projects.length,
      total,
      page: page || 1,
      totalPages: limit ? Math.ceil(total / limit) || 1 : 1,
      hasMore: limit && page ? page * limit < total : false,
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

/**
 * Helper: Upload a buffer stream to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    uploadStream.end(fileBuffer);
  });
};

/**
 * Helper: Upload files concurrently using Promise.allSettled and map back to final previewImages
 */
const processProjectImages = async (files, reqBody, userId, slug) => {
  const MediaAsset = require("../models/MediaAsset");

  // Parse existing previewImages from body (can be JSON string or array)
  let existingImages = [];
  if (reqBody.previewImages) {
    try {
      existingImages = typeof reqBody.previewImages === "string"
        ? JSON.parse(reqBody.previewImages)
        : reqBody.previewImages;
    } catch {
      existingImages = Array.isArray(reqBody.previewImages) ? reqBody.previewImages : [reqBody.previewImages];
    }
  }

  // Parse imageOrderMap if provided (e.g. ['url1', 'file:0', 'file:1', 'url2'])
  let imageOrder = [];
  if (reqBody.imageOrder) {
    try {
      imageOrder = typeof reqBody.imageOrder === "string" ? JSON.parse(reqBody.imageOrder) : reqBody.imageOrder;
    } catch {
      imageOrder = [];
    }
  }

  const failedUploads = [];
  const uploadedFileMap = new Map(); // file index -> uploaded url

  if (Array.isArray(files) && files.length > 0) {
    const folderPath = `user_${userId || "admin"}/projects/${slug || "gallery"}`;

    // Concurrently upload all attached files using Promise.allSettled
    const uploadTasks = files.map((file, fileIdx) => {
      const uploadOptions = {
        folder: folderPath,
        resource_type: "auto",
        use_filename: true,
        unique_filename: true,
      };

      return uploadToCloudinary(file.buffer, uploadOptions)
        .then(async (cloudinaryResult) => {
          // Derive clean short path
          const uploadRegex = /\/upload\/(?:[a-zA-Z0-9_,]+\/)?(.*)$/;
          const match = cloudinaryResult.secure_url.match(uploadRegex);
          const shortPath = match && match[1] ? match[1] : cloudinaryResult.public_id;

          // Record MediaAsset
          await MediaAsset.create({
            userId: userId || null,
            section: "projects",
            category: slug || "gallery",
            publicId: cloudinaryResult.public_id,
            url: cloudinaryResult.url,
            secureUrl: cloudinaryResult.secure_url,
            shortPath,
            originalName: file.originalname,
            format: cloudinaryResult.format,
            bytes: cloudinaryResult.bytes,
            resourceType: cloudinaryResult.resource_type,
          });

          return {
            fileIdx,
            originalName: file.originalname,
            url: cloudinaryResult.secure_url,
          };
        });
    });

    const settledResults = await Promise.allSettled(uploadTasks);

    settledResults.forEach((res, idx) => {
      const file = files[idx];
      if (res.status === "fulfilled") {
        uploadedFileMap.set(idx, res.value.url);
      } else {
        const errorMsg = res.reason?.message || "Cloudinary upload failed";
        console.error(`[Project Upload Failed] ${file.originalname}:`, errorMsg);
        failedUploads.push({
          originalName: file.originalname,
          reason: errorMsg,
        });
      }
    });
  }

  // Reconstruct final previewImages array adhering to user-defined order
  let finalPreviewImages = [];

  if (Array.isArray(imageOrder) && imageOrder.length > 0) {
    imageOrder.forEach((token) => {
      if (typeof token === "string" && token.startsWith("file:")) {
        const fIdx = parseInt(token.split(":")[1], 10);
        if (uploadedFileMap.has(fIdx)) {
          finalPreviewImages.push(uploadedFileMap.get(fIdx));
        }
      } else if (typeof token === "string" && token.trim()) {
        finalPreviewImages.push(token.trim());
      }
    });
  } else {
    // Default fallback: existing urls first, then new uploaded urls
    finalPreviewImages = [...existingImages];
    for (const [_, url] of uploadedFileMap.entries()) {
      finalPreviewImages.push(url);
    }
  }

  return {
    finalPreviewImages,
    failedUploads,
  };
};

/**
 * Helper: Safely parse JSON or scalar fields from FormData body
 */
const sanitizeProjectBody = (body) => {
  const data = { ...body };
  delete data.files;
  delete data.imageOrder;

  if (typeof data.technologies === "string") {
    try {
      data.technologies = JSON.parse(data.technologies);
    } catch {
      data.technologies = data.technologies.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }

  if (typeof data.hasDetailPage === "string") {
    data.hasDetailPage = data.hasDetailPage === "true";
  }
  if (typeof data.isVisible === "string") {
    data.isVisible = data.isVisible === "true";
  }
  if (typeof data.isFeaturedOnHome === "string") {
    data.isFeaturedOnHome = data.isFeaturedOnHome === "true";
  }
  if (typeof data.order === "string") {
    data.order = Number(data.order) || 0;
  }

  return data;
};

// @desc    Create a new project (Single API: FormData fields + files + Promise.allSettled)
// @route   POST /api/projects
// @access  Private (Admin)
exports.createProject = async (req, res) => {
  try {
    const body = req.body || {};
    const { title, slug } = body;
    if (!title || !title.trim()) {
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

    // Process all attached image files with Promise.allSettled
    const userId = req.user ? req.user._id.toString() : null;
    const { finalPreviewImages, failedUploads } = await processProjectImages(
      req.files || [],
      body,
      userId,
      finalSlug
    );

    const projectData = sanitizeProjectBody(body);
    projectData.slug = finalSlug;
    projectData.previewImages = finalPreviewImages;

    const project = await Project.create(projectData);

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
      failedUploads, // Detail any specific files that failed so frontend can notify user
    });
  } catch (err) {
    console.error("Error in createProject:", err);
    res.status(500).json({ success: false, message: err.message || "Server error creating project" });
  }
};

// @desc    Update project (Single API: FormData fields + files + Promise.allSettled)
// @route   PUT /api/projects/:id
// @access  Private (Admin)
exports.updateProject = async (req, res) => {
  try {
    const body = req.body || {};
    let project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check slug collision if slug is being updated
    if (body.slug && body.slug !== project.slug) {
      const existing = await Project.findOne({ slug: body.slug, _id: { $ne: project._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: "A project with this slug already exists" });
      }
    }

    const currentSlug = body.slug || project.slug;

    // Process all attached image files with Promise.allSettled
    const userId = req.user ? req.user._id.toString() : null;
    const { finalPreviewImages, failedUploads } = await processProjectImages(
      req.files || [],
      body,
      userId,
      currentSlug
    );

    const projectData = sanitizeProjectBody(body);
    projectData.previewImages = finalPreviewImages;

    project = await Project.findByIdAndUpdate(req.params.id, projectData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project,
      failedUploads, // Detail any specific files that failed so frontend can notify user
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

    // Clean up any Cloudinary images associated with this project
    if (Array.isArray(project.previewImages) && project.previewImages.length > 0) {
      const MediaAsset = require("../models/MediaAsset");
      for (const imgUrl of project.previewImages) {
        if (imgUrl && typeof imgUrl === "string" && imgUrl.includes("res.cloudinary.com")) {
          try {
            // Extract publicId from URL
            // Pattern: /upload/(?:v\d+/)?(user_[^/]+/[^/]+/[^/]+/[^.]+)
            const match = imgUrl.match(/\/upload\/(?:v\d+\/)?([^.]+)/);
            if (match && match[1]) {
              const publicId = match[1];
              await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
              await MediaAsset.deleteOne({ publicId });
            }
          } catch (cleanErr) {
            console.error("Error deleting image from Cloudinary:", cleanErr.message);
          }
        }
      }
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

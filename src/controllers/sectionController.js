const HeroSection = require("../models/HeroSection");

/**
 * Default fallback data if no hero document has been saved in MongoDB yet
 */
const DEFAULT_HERO_DATA = {
  logoText: "Vijay Kumar",
  logoUrl: "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1792239298/logo_white_4x-1_caa6ld.png",
  titlePrefix: "Software",
  titleHighlight: "Developer",
  subtitle: "Crafting scalable, high-performance web applications and intuitive digital experiences.",
  heroImageUrl: "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1773030225/portfolio_app/hero_img.webp",
  resumes: [
    {
      label: "Download Resume",
      url: "https://drive.google.com/uc?export=download&id=1QfIBC0J_QRX4MRoycDwEdD3xBt2kKSpE",
      isPrimary: true,
    },
  ],
  ctaContactText: "Get in Touch",
  ctaContactHref: "#contact",
  isVisible: true,
};

/**
 * @desc    Get Hero and Navbar configuration
 * @route   GET /api/sections/hero
 * @access  Public
 */
const getHeroSection = async (_req, res) => {
  try {
    let hero = await HeroSection.findOne().lean();

    // Auto-seed if not created yet
    if (!hero) {
      hero = await HeroSection.create(DEFAULT_HERO_DATA);
    }

    return res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.error("getHeroSection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch hero section.",
      fallback: DEFAULT_HERO_DATA,
    });
  }
};

/**
 * @desc    Update or create Hero and Navbar configuration
 * @route   PUT /api/sections/hero
 * @access  Private (Admin only)
 */
const updateHeroSection = async (req, res) => {
  try {
    const {
      logoText,
      logoUrl,
      titlePrefix,
      titleHighlight,
      subtitle,
      heroImageUrl,
      resumes,
      ctaContactText,
      ctaContactHref,
      isVisible,
    } = req.body;

    let hero = await HeroSection.findOne();

    if (!hero) {
      hero = new HeroSection(DEFAULT_HERO_DATA);
    }

    if (logoText !== undefined) hero.logoText = logoText.trim();
    if (logoUrl !== undefined) hero.logoUrl = logoUrl.trim();
    if (titlePrefix !== undefined) hero.titlePrefix = titlePrefix.trim();
    if (titleHighlight !== undefined) hero.titleHighlight = titleHighlight.trim();
    if (subtitle !== undefined) hero.subtitle = subtitle.trim();
    if (heroImageUrl !== undefined) hero.heroImageUrl = heroImageUrl.trim();
    if (ctaContactText !== undefined) hero.ctaContactText = ctaContactText.trim();
    if (ctaContactHref !== undefined) hero.ctaContactHref = ctaContactHref.trim();
    if (isVisible !== undefined) hero.isVisible = Boolean(isVisible);

    // Validate resumes: Max 3 resumes allowed
    if (Array.isArray(resumes)) {
      const sanitizedResumes = resumes.slice(0, 3).map((r, index) => ({
        label: r.label?.trim() || `Resume ${index + 1}`,
        url: r.url?.trim() || "",
        isPrimary: Boolean(r.isPrimary),
      }));
      hero.resumes = sanitizedResumes;
    }

    await hero.save();

    return res.status(200).json({
      success: true,
      message: "Hero section updated successfully.",
      data: hero,
    });
  } catch (error) {
    console.error("updateHeroSection error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update hero section.",
      error: error.message,
    });
  }
};

module.exports = {
  getHeroSection,
  updateHeroSection,
};

/**
 * ==============================================================================
 * Centralized Defaults & Fallback Data (Backend)
 * ==============================================================================
 * All initial seeding data and error fallback objects are declared here in one place.
 * You can easily inspect and update fallback/default data without touching controllers.
 */

const defaultSkills = require("./defaultSkills.json");

/**
 * 1. Hero & Navbar Section Defaults
 */
const DEFAULT_HERO_DATA = {
  logoText: "test name",
  logoUrl: "",
  titlePrefix: "Software",
  titleHighlight: "Developer",
  subtitle:
    "Crafting scalable, high-performance web applications and intuitive digital experiences.",
  heroImageUrl:
    "https://res.cloudinary.com/dtgn3hnzh/image/upload/v1792249847/hero_img_oharzk",
  // resumes: [
  //   {
  //     label: "Download Resume",
  //     // Dummy url commented out as requested
  //     // url: "https://drive.google.com/uc?export=download&id=1QfIBC0J_QRX4MRoycDwEdD3xBt2kKSpE",
  //     url: "",
  //     isPrimary: true,
  //   },
  // ],
  ctaContactText: "Get in Touch",
  ctaContactHref: "#contact",
  isVisible: true,
};

/**
 * 2. Skills & Technologies Defaults (Imported from defaultSkills.json)
 */
const DEFAULT_SKILLS = defaultSkills;

module.exports = {
  DEFAULT_HERO_DATA,
  DEFAULT_SKILLS,
};

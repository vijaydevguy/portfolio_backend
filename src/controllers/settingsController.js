const CommonSettings = require("../models/CommonSettings");

const DEFAULT_SETTINGS = {
  calComLink: "vijay-kumar/30min",
  calComNamespace: "quick-chat",
  isCalComPublished: true,
  phoneNumber: "+919876543210",
  phoneDisplay: "+91 98765 43210",
  phoneCountryIso: "IN",
  phoneCountryCode: "+91",
  phoneNational: "9876543210",
  isPhonePublished: true,
  email: "vijaydevguy@gmail.com",
  isEmailPublished: true,
  whatsappNumber: "919876543210",
  whatsappCountryIso: "IN",
  whatsappCountryCode: "+91",
  whatsappNational: "9876543210",
  whatsappPrefilledMessage:
    "Hi Vijay, I came across your portfolio and would like to discuss an opportunity with you!",
  isWhatsappPublished: true,
  googleAnalyticsId: "G-GY8ENHWSSB",
  isAnalyticsPublished: true,
};

/**
 * @desc    Get common settings (cal.com, phone, email, whatsapp)
 * @route   GET /api/settings/common
 * @access  Public
 */
const getCommonSettings = async (_req, res) => {
  try {
    let settings = await CommonSettings.findOne().lean();

    if (!settings) {
      settings = await CommonSettings.create(DEFAULT_SETTINGS);
    }

    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.error("getCommonSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch common settings.",
      fallback: DEFAULT_SETTINGS,
    });
  }
};

/**
 * @desc    Update common settings
 * @route   PUT /api/settings/common
 * @access  Private (Admin only)
 */
const updateCommonSettings = async (req, res) => {
  try {
    const {
      calComLink,
      calComNamespace,
      isCalComPublished,
      phoneNumber,
      phoneDisplay,
      phoneCountryIso,
      phoneCountryCode,
      phoneNational,
      isPhonePublished,
      email,
      isEmailPublished,
      whatsappNumber,
      whatsappCountryIso,
      whatsappCountryCode,
      whatsappNational,
      whatsappPrefilledMessage,
      isWhatsappPublished,
      googleAnalyticsId,
      isAnalyticsPublished,
    } = req.body;

    let settings = await CommonSettings.findOne();

    if (!settings) {
      settings = new CommonSettings(DEFAULT_SETTINGS);
    }

    if (calComLink !== undefined) settings.calComLink = calComLink.trim();
    if (calComNamespace !== undefined) settings.calComNamespace = calComNamespace.trim();
    if (isCalComPublished !== undefined) settings.isCalComPublished = Boolean(isCalComPublished);
    if (phoneNumber !== undefined) settings.phoneNumber = phoneNumber.trim();
    if (phoneDisplay !== undefined) settings.phoneDisplay = phoneDisplay.trim();
    if (phoneCountryIso !== undefined) settings.phoneCountryIso = phoneCountryIso.trim();
    if (phoneCountryCode !== undefined) settings.phoneCountryCode = phoneCountryCode.trim();
    if (phoneNational !== undefined) settings.phoneNational = phoneNational.trim();
    if (isPhonePublished !== undefined) settings.isPhonePublished = Boolean(isPhonePublished);
    if (email !== undefined) settings.email = email.trim().toLowerCase();
    if (isEmailPublished !== undefined) settings.isEmailPublished = Boolean(isEmailPublished);
    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber.trim();
    if (whatsappCountryIso !== undefined) settings.whatsappCountryIso = whatsappCountryIso.trim();
    if (whatsappCountryCode !== undefined) settings.whatsappCountryCode = whatsappCountryCode.trim();
    if (whatsappNational !== undefined) settings.whatsappNational = whatsappNational.trim();
    if (whatsappPrefilledMessage !== undefined)
      settings.whatsappPrefilledMessage = whatsappPrefilledMessage.trim();
    if (isWhatsappPublished !== undefined) settings.isWhatsappPublished = Boolean(isWhatsappPublished);
    if (googleAnalyticsId !== undefined) settings.googleAnalyticsId = googleAnalyticsId.trim();
    if (isAnalyticsPublished !== undefined) settings.isAnalyticsPublished = Boolean(isAnalyticsPublished);

    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Common settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    console.error("updateCommonSettings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update common settings.",
      error: error.message,
    });
  }
};

module.exports = {
  getCommonSettings,
  updateCommonSettings,
  DEFAULT_SETTINGS,
};

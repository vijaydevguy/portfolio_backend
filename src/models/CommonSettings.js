const mongoose = require("mongoose");

const commonSettingsSchema = new mongoose.Schema(
  {
    // Cal.com Meeting Link & Namespace
    calComLink: {
      type: String,
      default: "vijay-kumar/30min",
      trim: true,
    },
    calComNamespace: {
      type: String,
      default: "quick-chat",
      trim: true,
    },
    isCalComPublished: {
      type: Boolean,
      default: true,
    },

    // Contact Phone Number
    phoneNumber: {
      type: String,
      default: "+919876543210",
      trim: true,
    },
    phoneDisplay: {
      type: String,
      default: "+91 98765 43210",
      trim: true,
    },
    phoneCountryIso: {
      type: String,
      default: "IN",
      trim: true,
    },
    phoneCountryCode: {
      type: String,
      default: "+91",
      trim: true,
    },
    phoneNational: {
      type: String,
      default: "9876543210",
      trim: true,
    },
    isPhonePublished: {
      type: Boolean,
      default: true,
    },

    // Primary Public / Contact Email
    email: {
      type: String,
      default: "vijaydevguy@gmail.com",
      trim: true,
      lowercase: true,
    },
    isEmailPublished: {
      type: Boolean,
      default: true,
    },

    // WhatsApp Contact
    whatsappNumber: {
      type: String,
      default: "919876543210",
      trim: true,
    },
    whatsappCountryIso: {
      type: String,
      default: "IN",
      trim: true,
    },
    whatsappCountryCode: {
      type: String,
      default: "+91",
      trim: true,
    },
    whatsappNational: {
      type: String,
      default: "9876543210",
      trim: true,
    },
    whatsappPrefilledMessage: {
      type: String,
      default:
        "Hi Vijay, I came across your portfolio and would like to discuss an opportunity with you!",
      trim: true,
    },
    isWhatsappPublished: {
      type: Boolean,
      default: true,
    },

    // Google Analytics 4
    googleAnalyticsId: {
      type: String,
      default: "G-GY8ENHWSSB",
      trim: true,
    },
    isAnalyticsPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("CommonSettings", commonSettingsSchema);

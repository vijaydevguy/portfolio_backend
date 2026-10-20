const ContactMessage = require("../models/ContactMessage");

// @desc    Submit a new contact message (Public)
// @route   POST /api/contact
// @access  Public
const submitContactMessage = async (req, res) => {
  try {
    const { name, email, countryCode, phoneNumber, fullPhoneNumber, reason, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const newMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      countryCode: countryCode || "+91",
      phoneNumber: (phoneNumber || "").trim(),
      fullPhoneNumber: (fullPhoneNumber || "").trim(),
      reason: (reason || "General").trim(),
      message: message.trim(),
      status: "unread",
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully! I will get in touch with you shortly.",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Server error submitting contact message",
      error: error.message,
    });
  }
};

// @desc    Get all contact messages (Admin, with pagination, search, status filter)
// @route   GET /api/contact/admin/all
// @access  Private/Admin
const getContactMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "all").trim();

    const query = {};

    if (status && status !== "all") {
      const statusArr = status
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (statusArr.length === 1) {
        query.status = statusArr[0];
      } else if (statusArr.length > 1) {
        query.status = { $in: statusArr };
      }
    } else {
      // By default in main contact inbox, exclude archived messages unless explicitly requested
      const includeArchived = req.query.includeArchived === "true";
      if (!includeArchived) {
        query.status = { $ne: "archived" };
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { reason: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
        { fullPhoneNumber: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ContactMessage.countDocuments(query);
    const unreadCount = await ContactMessage.countDocuments({ status: "unread" });
    const archivedCount = await ContactMessage.countDocuments({ status: "archived" });
    const totalCount = await ContactMessage.countDocuments();

    const messages = await ContactMessage.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      unreadCount,
      archivedCount,
      totalCount,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      messages,
    });
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching contact messages",
      error: error.message,
    });
  }
};

// @desc    Update message status or notes (Admin)
// @route   PUT /api/contact/:id
// @access  Private/Admin
const updateContactMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const message = await ContactMessage.findById(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    if (status !== undefined) {
      if (!["unread", "read", "replied", "archived"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }
      message.status = status;
    }

    if (notes !== undefined) {
      message.notes = notes;
    }

    await message.save();

    return res.status(200).json({
      success: true,
      message: "Contact message updated successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error updating contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Server error updating contact message",
      error: error.message,
    });
  }
};

// @desc    Delete contact message (Admin)
// @route   DELETE /api/contact/:id
// @access  Private/Admin
const deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await ContactMessage.findByIdAndDelete(id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Contact message not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting contact message:", error);
    return res.status(500).json({
      success: false,
      message: "Server error deleting contact message",
      error: error.message,
    });
  }
};

module.exports = {
  submitContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage,
};

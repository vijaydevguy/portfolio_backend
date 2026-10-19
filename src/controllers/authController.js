const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate JWT token helper
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || "default_portfolio_secret",
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Role selection: if role is not passed or not 'admin', strictly default to 'user'
    const selectedRole = req.body.role === "admin" ? "admin" : "user";

    const user = await User.create({
      name: name ? name.trim() : "",
      email: normalizedEmail,
      password,
      role: selectedRole,
      isBlocked: false,
      isFirstTime: true,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    console.error("Signup error details:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error during registration. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

/**
 * @desc    Authenticate user & return token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email and explicitly select password
    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Check if account is blocked
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been suspended by the administrator. Please contact support.",
      });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isFirstTime: user.isFirstTime,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login. Please try again.",
    });
  }
};

/**
 * @desc    Get current authenticated user info
 * @route   GET /api/auth/me
 * @access  Private (Bearer token)
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked,
        isFirstTime: user.isFirstTime,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
};

/**
 * @desc    Get all users with pagination and search
 * @route   GET /api/auth/users?page=1&limit=10&search=
 * @access  Private (Admin role only)
 */
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const searchQuery = req.query.search ? req.query.search.trim() : "";
    const filter = searchQuery
      ? {
          $or: [
            { email: { $regex: searchQuery, $options: "i" } },
            { name: { $regex: searchQuery, $options: "i" } },
          ],
        }
      : {};

    const [totalUsers, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(totalUsers / limit) || 1;

    return res.status(200).json({
      success: true,
      users: users.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        role: u.role,
        isBlocked: u.isBlocked,
        isFirstTime: u.isFirstTime,
        createdAt: u.createdAt,
      })),
      pagination: {
        page,
        limit,
        totalUsers,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("getAllUsers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users list.",
    });
  }
};

/**
 * @desc    Update a user (Role or Block status)
 * @route   PUT /api/auth/users/:id
 * @access  Private (Admin role only)
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, isBlocked, name } = req.body;

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Safety rule: Prevent super admin from accidentally blocking themselves
    if (req.user._id.toString() === id && isBlocked === true) {
      return res.status(400).json({
        success: false,
        message: "You cannot block your own super-admin account.",
      });
    }

    if (name !== undefined) targetUser.name = name.trim();
    if (role !== undefined && ["admin", "user"].includes(role)) {
      targetUser.role = role;
    }
    if (isBlocked !== undefined) {
      targetUser.isBlocked = Boolean(isBlocked);
    }

    await targetUser.save();

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: {
        id: targetUser._id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        isBlocked: targetUser.isBlocked,
        isFirstTime: targetUser.isFirstTime,
      },
    });
  } catch (error) {
    console.error("updateUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user.",
    });
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin role only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Safety rule: Super admin cannot delete themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own logged-in account.",
      });
    }

    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("deleteUser error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getAllUsers,
  updateUser,
  deleteUser,
};


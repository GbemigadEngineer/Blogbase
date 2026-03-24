const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// @desc    Admin login
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Username and password are required",
        });
    }

    const admin = await Admin.findOne({
      username: username.toLowerCase(),
    }).select("+password");

    if (!admin || !(await admin.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    res.json({
      success: true,
      token: generateToken(admin._id),
      admin: { id: admin._id, username: admin.username },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current admin
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  res.json({
    success: true,
    admin: { id: req.admin._id, username: req.admin.username },
  });
};

module.exports = { login, getMe };

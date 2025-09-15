const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");
const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt for:", email);

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email }).populate("tenantId");
    console.log("User found:", user ? user.email : "No user found");

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Debug: Check what's being compared
    console.log("Stored password hash:", user.password);
    console.log("Input password:", password);

    // Test bcrypt directly
    const bcrypt = require("bcryptjs");
    const directCompare = await bcrypt.compare(password, user.password);
    console.log("Direct bcrypt compare result:", directCompare);

    // Use the correctPassword method
    const isPasswordValid = await user.correctPassword(password);
    console.log("Method compare result:", isPasswordValid);

    if (!isPasswordValid) {
      console.log("Password validation failed");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId._id,
      tenantSlug: user.tenantId.slug,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    console.log("Login successful for:", user.email);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        tenant: user.tenantId,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = express.Router();

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h"
    });

    res.json({ token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

// Test admin creation route (for initial setup)
router.post("/setup", async (req, res) => {
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ role: "admin" });
    if (adminExists) {
      return res.status(400).json({ error: "Admin already exists" });
    }

    // Create admin user
    const admin = new User({
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "admin123",
      role: "admin"
    });

    await admin.save();
    res.status(201).json({ message: "Admin user created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
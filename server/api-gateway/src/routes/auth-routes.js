const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const User = require("../models/User");

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup
router.post("/signup", async (req, res) => {
  try {
    const { fullname, email, password } = req.body;
    
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const verificationCode = generateVerificationCode();
    
    const user = new User({
      fullname,
      email,
      password,
      verificationCode,
    });
    
    await user.save();

    // Send verification email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Account",
      text: `Your verification code is: ${verificationCode}`,
    });

    res.status(201).json({ message: "User created. Please verify your email" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Email verification
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !user.isVerified) {
      return res.status(401).json({ error: "Invalid credentials or unverified email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, user: { id: user._id, fullname: user.fullname, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const verificationCode = generateVerificationCode();
    user.verificationCode = verificationCode;
    await user.save();

    // Send reset email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset",
      text: `Your password reset code is: ${verificationCode}`,
    });

    res.json({ message: "Password reset code sent to email" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    const user = await User.findOne({ email, verificationCode: code });
    if (!user) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    user.password = newPassword;
    user.verificationCode = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const User = require("./models/user");
const authMiddleware = require("./middleware/auth-middleware");

router.post("/update-profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.sub;
    const { name, email, image } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    let user = await User.findOne({ googleId: userId });
    if (!user && email) {
      user = await User.findOne({ email });
    }
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (name) user.name = name;
    if (email) user.email = email;
    if (image) user.image = image;
    await user.save();
    res.json({ success: true, data: { name: user.name, email: user.email, image: user.image } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.sub;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    let user = await User.findOne({ googleId: userId });
    if (!user && req.user.email) {
      user = await User.findOne({ email: req.user.email });
    }
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        image: user.image,
        loginCount: user.loginCount,
        loginLogs: user.loginLogs,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const User = require("./models/user");

// Upsert user after Google login
router.post("/google-login", async (req, res) => {
  try {
    const { googleId, name, email, image } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ error: "Missing googleId or email" });
    }
    // Try to find user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    if (user) {
      // Log login event and increment login count
      if (!user.loginLogs) user.loginLogs = [];
      user.loginLogs.push({ date: new Date(), message: "User logged in" });
      user.loginCount = (user.loginCount || 0) + 1;
      user.googleId = googleId; // update googleId if missing
      user.name = name;
      user.email = email;
      user.image = image;
      await user.save();
      return res
        .status(200)
        .json({
          success: true,
          user,
          message:
            "User exists, login logged and count incremented",
        });
    } else {
      user = new User({
        googleId,
        name,
        email,
        image,
        loginLogs: [
          { date: new Date(), message: "User created and logged in" },
        ],
        loginCount: 1,
      });
      await user.save();
      return res
        .status(201)
        .json({
          success: true,
          user,
          message: "User created and login logged",
        });
    }
  } catch (error) {
    console.error("Failed to upsert user", error);
    res.status(500).json({ error: "Failed to upsert user" });
  }
});

module.exports = router;

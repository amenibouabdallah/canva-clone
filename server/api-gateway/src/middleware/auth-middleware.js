const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("No token provided in Authorization header");
      return res.status(401).json({ error: "Access denied! No Token provided" });
    }

    // Try JWT verification first
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new Error("User not found");
      }
      req.user = user;
      req.headers["x-user-id"] = user._id.toString();
      return next();
    } catch (jwtError) {
      // If JWT verification fails, try OAuth
      console.log("Attempting OAuth verification");
    }

    // OAuth verification
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    
    // Check if user exists, if not create new user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        fullname: payload.name,
        email: payload.email,
        profilePicture: payload.picture,
        isVerified: true, // OAuth users are auto-verified
      });
      await user.save();
    }

    req.user = user;
    req.headers["x-user-id"] = user._id.toString();
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    res.status(401).json({ error: "Access denied! Please login to continue" });
  }
}

module.exports = authMiddleware;
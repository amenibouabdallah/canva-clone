const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function authMiddleware(req, res, next) {
  try {
    console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.error("No token provided in Authorization header");
      return res.status(401).json({ error: "Access denied! No Token provided" });
    }

    console.log("Token received:", token);

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // Ensure this matches the client ID
    });

    const payload = ticket.getPayload();
    console.log("Token payload:", payload);

    // Set the x-user-id header for downstream services
    req.headers["x-user-id"] = payload.sub; // Use the `sub` field as the user ID

    req.user = payload; // Attach user info to the request
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    console.error("Error details:", error);
    res.status(401).json({ error: "Access denied! Please login to continue" });
  }
}

module.exports = authMiddleware;

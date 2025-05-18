require("dotenv").config();
const express = require("express");
const proxy = require("express-http-proxy");
const cors = require("cors");
const helmet = require("helmet");
const authMiddleware = require("./middleware/auth-middleware");
const mongoose = require("mongoose");
const googleAuthRoutes = require("./google-auth-routes");
const userRoutes = require("./user-routes");

const app = express();
const PORT = 5004; // Hardcoded port for the API Gateway

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Proxy options
const proxyOptions = {
  proxyReqPathResolver: (req) => {
    return req.originalUrl.replace(/^\/v1/, "/api");
  },
  proxyErrorHandler: (err, res, next) => {
    res.status(500).json({
      message: "Internal server error!",
      error: err.message,
    });
  },
};

// Hardcoded service addresses
const DESIGN_SERVICE = "http://localhost:5001";
const UPLOAD_SERVICE = "http://localhost:5002";
const SUBSCRIPTION_SERVICE = "http://localhost:5000";
const ADMIN_SERVICE = "http://localhost:4004";

app.use(
  "/v1/designs",
  authMiddleware,
  proxy(DESIGN_SERVICE, {
    ...proxyOptions,
  })
);

app.use(
  "/v1/media/upload",
  authMiddleware,
  proxy(UPLOAD_SERVICE, {
    ...proxyOptions,
    parseReqBody: false,
  })
);

app.use(
  "/v1/media",
  authMiddleware,
  proxy(UPLOAD_SERVICE, {
    ...proxyOptions,
    parseReqBody: true,
  })
);

app.use(
  "/v1/subscription",
  authMiddleware,
  proxy(SUBSCRIPTION_SERVICE, {
    ...proxyOptions,
  })
);

app.use(
  "/v1/admin",
  proxy(ADMIN_SERVICE, {
    ...proxyOptions,
    proxyReqPathResolver: (req) => req.originalUrl.replace(/^\/v1\/admin/, ""),
  })
);

app.use("/auth", googleAuthRoutes);
app.use("/user", userRoutes);

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`DESIGN Service is running on ${DESIGN_SERVICE}`);
  console.log(`UPLOAD Service is running on ${UPLOAD_SERVICE}`);
  console.log(`SUBSCRIPTION Service is running on ${SUBSCRIPTION_SERVICE}`);
  console.log(`ADMIN Service is running on ${ADMIN_SERVICE}`);
});

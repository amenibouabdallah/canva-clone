require("dotenv").config();
const express = require("express");
const proxy = require("express-http-proxy");
const cors = require("cors");
const helmet = require("helmet");
const authMiddleware = require("./middleware/auth-middleware");
const authRoutes = require("./routes/auth-routes");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 5004;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth routes
app.use("/v1/auth", authRoutes);

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

// Service addresses
const DESIGN_SERVICE = process.env.DESIGN;
const UPLOAD_SERVICE = process.env.UPLOAD;
const SUBSCRIPTION_SERVICE = process.env.SUBSCRIPTION;

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

app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  console.log(`DESIGN Service is running on ${DESIGN_SERVICE}`);
  console.log(`UPLOAD Service is running on ${UPLOAD_SERVICE}`);
  console.log(`SUBSCRIPTION Service is running on ${SUBSCRIPTION_SERVICE}`);
});
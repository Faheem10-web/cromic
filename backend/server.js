import "./config/env.js";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import mongoose from "mongoose";
import { connectDB } from "./database/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import aboutRoutes from "./routes/aboutRoutes.js";
import lookbookRoutes from "./routes/lookbookRoutes.js";
import campaignRoutes from "./routes/campaignRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";

// Error middleware
import { errorHandler, notFound } from "./middleware/errorHandler.js";

// Track server startup time
const serverStartTime = Date.now();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable response compression (Gzip)
app.use(compression());

// Performance logging middleware to track request execution times
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 200) {
      console.log(`[SLOW API ALERT] ${req.method} ${req.originalUrl} took ${duration}ms`);
    } else {
      console.log(`[API Log] ${req.method} ${req.originalUrl} took ${duration}ms`);
    }
  });
  next();
});

// Cache-Control Header Middleware for API GET requests
app.use("/api", (req, res, next) => {
  if (req.method === "GET") {
    if (process.env.NODE_ENV === "development") {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
    } else {
      res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    }
  }
  next();
});

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

const allowedOrigins = [
  "https://cromic.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin) ||
      /^https:\/\/cromic-[a-zA-Z0-9-]+\.vercel\.app$/.test(origin) ||
      /^http:\/\/localhost:\d+$/.test(origin) ||
      /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // Cache preflight response for 24 hours to improve performance
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
// Middleware to ensure DB connection is ready for API calls
app.use("/api", async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Database connection failure on API request:", err.message);
  }
  next();
});

// Enhanced Health Endpoint to check DB state
app.get("/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = dbStates[mongoose.connection.readyState] || "unknown";

  res.json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date()
  });
});

// Also support /api/health endpoint
app.get("/api/health", (req, res) => {
  const dbStates = ["disconnected", "connected", "connecting", "disconnecting"];
  const dbStatus = dbStates[mongoose.connection.readyState] || "unknown";

  res.json({
    status: "healthy",
    database: dbStatus,
    timestamp: new Date()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/lookbook", lookbookRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/settings", settingsRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;

// Start server locally if run directly and not in Vercel Serverless environment
const isDirectExecution = process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("server.js");

if (!process.env.VERCEL && isDirectExecution) {
  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
        console.log(`Total server startup sequence took ${Date.now() - serverStartTime}ms`);
      });
    } catch (error) {
      console.error("Could not start server due to database connection issue:", error.message);
    }
  };

  startServer();
}


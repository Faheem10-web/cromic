import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dns from "dns";
import mongoose from "mongoose";
import { preventDestructiveOperations } from "../database/safety.js";

// Register safety safeguards globally on Mongoose schemas
mongoose.plugin(preventDestructiveOperations);


// Configure Node.js to use Google and Cloudflare public DNS servers
// This fixes c-ares resolver issues with MongoDB Atlas DNS SRV records (mongodb+srv://)
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
  console.log("[DNS Log] Configured custom DNS servers: 8.8.8.8, 1.1.1.1");
} catch (err) {
  console.warn("[DNS Log] Failed to set custom DNS servers:", err.message);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve paths to possible .env locations:
// 1. backend/.env (parent directory of this file)
// 2. root/.env (two directories up from this file)
const backendEnvPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../.env");

let resolvedPath = null;

if (fs.existsSync(backendEnvPath)) {
  dotenv.config({ path: backendEnvPath });
  resolvedPath = backendEnvPath;
} else if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
  resolvedPath = rootEnvPath;
} else {
  dotenv.config(); // Fallback to default
  resolvedPath = "process.cwd()";
}

// Add debug logs to confirm loaded environment state
console.log(`[Env Log] Configuration loaded successfully.`);
console.log(`[Env Log] Resolved path: ${resolvedPath}`);
console.log(`[Env Log] MONGODB_URI: ${process.env.MONGODB_URI ? "LOADED" : "MISSING"}`);
if (process.env.MONGODB_URI) {
  // Safe print of a portion of connection string for verification without leaking passwords fully
  const parts = process.env.MONGODB_URI.split("@");
  const host = parts[1] || parts[0];
  console.log(`[Env Log] Target Database Host: ${host}`);
}
console.log(`[Env Log] CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? "LOADED" : "MISSING"}`);
console.log(`[Env Log] PORT: ${process.env.PORT || 5000}`);
console.log(`[Env Log] NODE_ENV: ${process.env.NODE_ENV || "development"}`);

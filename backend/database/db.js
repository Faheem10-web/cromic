import "../config/env.js";
import mongoose from "mongoose";
import dns from "dns";
import { autoSeed } from "./autoSeed.js";
import { isProductionDatabase, patchConnectionSafety } from "./safety.js";

// Listen to Mongoose connection events for improved observability
mongoose.connection.on("connected", () => {
  console.log("[Database Log] Mongoose connection opened successfully to MongoDB Atlas.");
});
mongoose.connection.on("error", (err) => {
  console.error(`[Database Log] Mongoose connection error: ${err.message}`);
});
mongoose.connection.on("disconnected", () => {
  console.log("[Database Log] Mongoose connection disconnected.");
});

// Graceful shutdown listener to clean up database connections when the process ends
const gracefulShutdown = (signal) => {
  mongoose.connection.close(() => {
    console.log(`[Database Log] Mongoose connection closed due to application termination (${signal}).`);
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

let cachedPromise = null;
let currentRetryCount = 0;
const MAX_CONNECT_RETRIES = 5;
const INITIAL_BACKOFF_MS = 1000;

/**
 * Diagnostic utility to check and log network/DNS details on failure
 */
async function runDnsDiagnostics() {
  console.log("\n--- [DNS Diagnostic Check] ---");
  try {
    const servers = dns.getServers();
    console.log(`Active DNS Servers: ${servers.join(", ")}`);
  } catch (err) {
    console.warn("Could not retrieve active DNS servers:", err.message);
  }

  // Test generic internet name resolution
  try {
    const ip = await dns.promises.resolve("google.com");
    console.log(`DNS Internet Test (google.com): Success -> IP: ${ip[0]}`);
  } catch (err) {
    console.error(`DNS Internet Test (google.com): FAILED (${err.message}). Internet connection might be down.`);
  }

  // Parse connection string for target hostname to diagnose directly
  if (process.env.MONGODB_URI) {
    try {
      const match = process.env.MONGODB_URI.match(/@([^/]+)/);
      if (match && match[1]) {
        const fullHost = match[1].split("?")[0];
        console.log(`Target Hostname to Resolve: ${fullHost}`);
        
        // If srv connection format
        if (process.env.MONGODB_URI.startsWith("mongodb+srv://")) {
          const srvLookupName = `_mongodb._tcp.${fullHost}`;
          console.log(`Querying SRV Record: ${srvLookupName}`);
          const srvRecords = await dns.promises.resolveSrv(srvLookupName);
          console.log("SRV Resolution Result:", JSON.stringify(srvRecords, null, 2));
        } else {
          const hostIPs = await dns.promises.resolve(fullHost);
          console.log("Hostname IP Resolution Result:", hostIPs.join(", "));
        }
      }
    } catch (err) {
      console.error(`Database Host DNS Lookup FAILED: ${err.message}`);
      console.error(`- Check if your ISP or router blocks SRV DNS lookups.`);
      console.error(`- Check if your corporate firewall/proxy blocks outgoing traffic on port 27017.`);
      console.error(`- Ensure your IP address is whitelisted on your MongoDB Atlas Network Access panel.`);
    }
  }
  console.log("-------------------------------\n");
}

export async function connectDB() {
  // If already connected, return connection immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, reuse existing connection promise
  if (cachedPromise && mongoose.connection.readyState === 2) {
    return cachedPromise;
  }

  if (!process.env.MONGODB_URI) {
    if (!global._mongoDbUriWarned) {
      console.warn("[MongoDB] MONGODB_URI environment variable is missing. Database operations will fail fast.");
      global._mongoDbUriWarned = true;
    }
    mongoose.set("bufferCommands", false);
    return false;
  }

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 8000, // Wait up to 8 seconds for server selection
    socketTimeoutMS: 45000,
    family: 4, // Force IPv4 to bypass IPv6 lookup delays/failures on some systems
  };

  const connectWithBackoff = async (delay = INITIAL_BACKOFF_MS) => {
    try {
      console.log(`[MongoDB Atlas] Connection attempt starting (Attempt ${currentRetryCount + 1}/${MAX_CONNECT_RETRIES})...`);
      const connection = await mongoose.connect(process.env.MONGODB_URI, options);
      console.log("[MongoDB Atlas] Connected successfully!");
      currentRetryCount = 0; // Reset retries on success
      
      // Enable connection drop protection
      patchConnectionSafety();
      
      // Trigger background auto-seeding only in development on dev databases
      if (process.env.NODE_ENV === "development" && !isProductionDatabase(process.env.MONGODB_URI)) {
        autoSeed().catch((err) => {
          console.error("Auto-seeding background execution failed:", err.message);
        });
      } else {
        console.log("[Database Safety] Automatic seeding bypassed (Production/Remote environment detected).");
      }
      
      return connection;
    } catch (error) {
      currentRetryCount++;
      console.error(`[MongoDB Atlas] Connection attempt ${currentRetryCount} failed: ${error.message}`);
      
      // Perform diagnostics on early retry failure
      if (currentRetryCount === 1) {
        await runDnsDiagnostics();
      }

      if (currentRetryCount < MAX_CONNECT_RETRIES) {
        console.log(`[MongoDB Atlas] Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return connectWithBackoff(delay * 2);
      } else {
        console.error("[MongoDB Atlas] Maximum connection attempts reached. Database is inaccessible.");
        cachedPromise = null;
        throw error;
      }
    }
  };

  cachedPromise = connectWithBackoff();
  return cachedPromise;
}

export default mongoose;


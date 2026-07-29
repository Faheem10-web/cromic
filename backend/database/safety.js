import mongoose from "mongoose";

/**
 * Checks if a MongoDB URI points to a production or live database.
 * Matches remote Atlas servers and checks for production keywords.
 * @param {string} uri MongoDB Connection String
 * @returns {boolean} True if classified as production
 */
export function isProductionDatabase(uri) {
  if (!uri) return false;

  // 1. If NODE_ENV is production, treat it as production
  if (process.env.NODE_ENV === "production") {
    return true;
  }

  // 2. Check connection string features
  const cleanUri = uri.toLowerCase();
  
  // Heuristic: Check if URI points to local database
  const isLocalhost = cleanUri.includes("localhost") || 
                      cleanUri.includes("127.0.0.1") || 
                      cleanUri.includes("mongodb://localhost") || 
                      cleanUri.includes("mongodb://127.0.0.1");

  if (!isLocalhost) {
    // If it's a remote connection, check for Atlas signatures or production names
    const isAtlas = cleanUri.includes("mongodb.net");
    const hasProdKeywords = /prod|production|live|main|cluster/i.test(cleanUri);
    const hasDevKeywords = /dev|development|test|local|sandbox/i.test(cleanUri);

    // If it's Atlas, or has production indicators and doesn't explicitly mention dev/sandbox, treat it as production/guarded
    if (isAtlas || hasProdKeywords || !hasDevKeywords) {
      return true;
    }
  }

  return false;
}

/**
 * Global Mongoose Schema plugin to block destructive queries in production.
 * Specifically targets empty deleteMany() or remove() calls.
 * @param {import('mongoose').Schema} schema 
 */
export function preventDestructiveOperations(schema) {
  const blockDestruction = async function() {
    const uri = process.env.MONGODB_URI;
    if (process.env.NODE_ENV === "production" || isProductionDatabase(uri)) {
      // Allow bypass ONLY in development when explicitly authorized (e.g. CLI seeding with --force)
      if (process.env.NODE_ENV === "development" && global._allowDestructiveOperations) {
        return;
      }
      
      const filter = this.getFilter ? this.getFilter() : {};
      
      // If the query is targeting all documents (empty filter)
      if (Object.keys(filter).length === 0) {
        const modelName = this.model ? this.model.modelName : "Unknown Model";
        throw new Error(
          `❌ DESTRUCTIVE OPERATION BLOCKED: An empty filter was passed to deleteMany() or remove() on model [${modelName}] in a production-like environment.`
        );
      }
    }
  };

  schema.pre("deleteMany", blockDestruction);
  schema.pre("remove", blockDestruction);
}

/**
 * Monkey-patches connection drop methods to prevent dropDatabase or dropCollection from the app.
 */
export function patchConnectionSafety() {
  if (mongoose.connection) {
    mongoose.connection.dropDatabase = function() {
      throw new Error("❌ DESTRUCTIVE OPERATION BLOCKED: dropDatabase() is strictly forbidden in this application to protect database integrity.");
    };

    mongoose.connection.dropCollection = function(name) {
      throw new Error(`❌ DESTRUCTIVE OPERATION BLOCKED: dropCollection("${name}") is strictly forbidden in this application to protect database integrity.`);
    };
  }
}

import "../backend/config/env.js";
import mongoose from "mongoose";
import Product from "../backend/models/Product.js";

async function runTest() {
  console.log("Connecting to database for safety query test...");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  try {
    console.log("Attempting destructive Product.deleteMany({})...");
    await Product.deleteMany({});
    console.log("❌ SUCCESS? (This should NOT have succeeded!)");
  } catch (error) {
    console.log("✅ BLOCKED SUCCESSFULLY! Received error:");
    console.log(error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

runTest();

import "../backend/config/env.js";
import mongoose from "mongoose";
import PageSettings from "../backend/models/PageSettings.js";

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const settings = await PageSettings.findOne().sort({ createdAt: 1 }).lean();
  console.log("Current database settings:", JSON.stringify(settings, null, 2));

  await mongoose.disconnect();
}

run();

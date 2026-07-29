import "../config/env.js";
import mongoose from "mongoose";
import PageSettings from "../models/PageSettings.js";
import HeroBanner from "../models/HeroBanner.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import CampaignSection from "../models/CampaignSection.js";
import Lookbook from "../models/Lookbook.js";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runBenchmark() {
  console.log("Connecting to MongoDB Atlas...");
  const connStart = Date.now();
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(`Connected in ${Date.now() - connStart}ms\n`);

  const queries = [
    {
      name: "1. Settings query (PageSettings.findOne)",
      fn: () => PageSettings.findOne().sort({ createdAt: 1 }).lean(),
    },
    {
      name: "2. Hero Banners query (HeroBanner.find)",
      fn: () => HeroBanner.find().sort({ banner_order: 1 }).lean(),
    },
    {
      name: "3. Featured Products query (Product.find)",
      fn: () => Product.find({ featured: true })
        .populate("category_id", "name slug")
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
    },
    {
      name: "4. Categories query (Category.find status: active)",
      fn: () => Category.find({ status: "active" })
        .select("name slug description image logo status createdAt")
        .sort({ name: 1 })
        .lean(),
    },
    {
      name: "5. Campaign query (CampaignSection.findOne)",
      fn: () => CampaignSection.findOne().sort({ createdAt: 1 }).lean(),
    },
    {
      name: "6. Lookbook query (Lookbook.find)",
      fn: () => Lookbook.find().sort({ createdAt: 1 }).lean(),
    }
  ];

  console.log("=== RUNNING DATABASE QUERY BENCHMARKS ===");
  for (const q of queries) {
    console.log(`Running: ${q.name}`);
    
    // Cold run
    const startCold = Date.now();
    await q.fn();
    const durationCold = Date.now() - startCold;
    console.log(`  - Cold run: ${durationCold}ms`);

    // Warm runs
    let totalWarm = 0;
    const runs = 3;
    for (let i = 0; i < runs; i++) {
      const startWarm = Date.now();
      await q.fn();
      totalWarm += (Date.now() - startWarm);
    }
    console.log(`  - Warm run average: ${(totalWarm / runs).toFixed(1)}ms`);
  }

  // Measure total sequential queries time
  console.log("\n=== SEQUENTIAL VS PARALLEL TEST ===");
  
  const startSeq = Date.now();
  await PageSettings.findOne().sort({ createdAt: 1 }).lean();
  await HeroBanner.find().sort({ banner_order: 1 }).lean();
  await Product.find({ featured: true }).populate("category_id", "name slug").sort({ createdAt: -1 }).limit(12).lean();
  await Category.find({ status: "active" }).select("name slug description image logo status createdAt").sort({ name: 1 }).lean();
  await CampaignSection.findOne().sort({ createdAt: 1 }).lean();
  await Lookbook.find().sort({ createdAt: 1 }).lean();
  const durationSeq = Date.now() - startSeq;
  console.log(`Total Sequential Queries: ${durationSeq}ms`);

  const startPar = Date.now();
  await Promise.all([
    PageSettings.findOne().sort({ createdAt: 1 }).lean(),
    HeroBanner.find().sort({ banner_order: 1 }).lean(),
    Product.find({ featured: true }).populate("category_id", "name slug").sort({ createdAt: -1 }).limit(12).lean(),
    Category.find({ status: "active" }).select("name slug description image logo status createdAt").sort({ name: 1 }).lean(),
    CampaignSection.findOne().sort({ createdAt: 1 }).lean(),
    Lookbook.find().sort({ createdAt: 1 }).lean()
  ]);
  const durationPar = Date.now() - startPar;
  console.log(`Total Parallel (Promise.all) Queries: ${durationPar}ms`);

  await mongoose.disconnect();
  console.log("\nDisconnected from MongoDB.");
}

runBenchmark().catch(console.error);

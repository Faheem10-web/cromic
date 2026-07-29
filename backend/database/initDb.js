import "../config/env.js";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { isProductionDatabase, patchConnectionSafety } from "./safety.js";

// Import models
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import HeroBanner from "../models/HeroBanner.js";
import AboutSection from "../models/AboutSection.js";
import Lookbook from "../models/Lookbook.js";
import CampaignSection from "../models/CampaignSection.js";

async function run() {
  const uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: Database initialization is strictly forbidden in production.");
    process.exit(1);
  }
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ERROR: Database initialization is only allowed when NODE_ENV=development.");
    process.exit(1);
  }

  console.log("Connecting to database for initialization...");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Apply connection safety drops protection
  patchConnectionSafety();

  try {
    const isProdDb = isProductionDatabase(uri);
    const hasForce = process.argv.includes("--force");

    if (isProdDb) {
      if (!hasForce) {
        console.error("\n❌ DATABASE INITIALIZATION PROTECTED");
        console.error("- Detected a remote/production-like MongoDB Atlas connection.");
        console.error("\nTo proceed with initialization, you must explicitly run this script with the --force flag:");
        console.error("  node backend/database/initDb.js --force\n");
        await mongoose.disconnect();
        process.exit(1);
      }
      console.warn("\n⚠️ WARNING: Initializing remote/production-like database because --force flag is specified.");
      global._allowDestructiveOperations = true;
    }
    // 1. Seed or update default Admin
    const adminEmail = process.env.ADMIN_EMAIL || "cromic@gmail.com";
    const adminPass = process.env.ADMIN_PASSWORD || "cromic123";
    const hashedPassword = await bcrypt.hash(adminPass, 10);
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      await Admin.create({ username: "admin", email: adminEmail, password: hashedPassword });
      console.log(`✓ Seeded default admin: ${adminEmail} / ${adminPass}`);
    } else {
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✓ Admin user verified: ${adminEmail}`);
    }

    // 2. Seed default Categories
    const defaultCategories = [
      { name: "Square", slug: "square", description: "Geometrically balanced square frames", status: "active", image: "https://i.pinimg.com/736x/69/e9/d6/69e9d6174ca43746724d5f8de4d71ce0.jpg" },
      { name: "Luxury", slug: "luxury", description: "Premium handcrafted luxury frames", status: "active", image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200" },
      { name: "Classic", slug: "classic", description: "Refined timeless silhouette classics", status: "active", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=1200" },
      { name: "Titanium", slug: "titanium", description: "Ultra-light titanium frames engineered for luxury", status: "active", image: "https://x8.adencys.com/img/products/ANIMA-X1-001/1.1.jpg" },
      { name: "Heritage", slug: "heritage", description: "Iconic eyewear refined with modern craft", status: "active", image: "https://i.pinimg.com/1200x/0b/35/65/0b35653ee75d43b2e7506fddfcb8d6e7.jpg" },
      { name: "Avant", slug: "avant", description: "Bold contemporary designs embracing innovation", status: "active", image: "https://i.pinimg.com/1200x/c7/fd/85/c7fd8584952f24e8e93b3ac61ff32de0.jpg" },
    ];

    for (const cat of defaultCategories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true }
      );
    }
    console.log("✓ Categories seeded.");

    // 3. Seed default Hero Banner
    const bannerCount = await HeroBanner.countDocuments();
    if (bannerCount === 0) {
      await HeroBanner.create({
        hero_image: null,
        hero_video: "/assets/hero3.mkv",
        title: "THE NEW\nBLACK ARROW",
        subtitle: "The classic PO3269S pairs an all-black finish with a silver-outlined Persol Arrow",
        button_text: "SHOP THE COLLECTION",
        button_link: "/shop",
        banner_order: 0,
        active_status: true,
      });
      console.log("✓ Seeded default hero banner.");
    } else {
      console.log("✓ Hero banners already exist.");
    }

    // 4. Seed default About Section
    const aboutCount = await AboutSection.countDocuments();
    if (aboutCount === 0) {
      await AboutSection.create({
        label: "OUR STORY",
        heading_line_1: "Crafted",
        heading_line_2: "Beyond",
        highlighted_word: "Vision",
        description: "meticulously crafted to turn heads, these oversized yet geometrically balanced frames with uniquely angled temples were crafted with you in mind. Escape from the mundane quotidian routine and release the inner you.",
        button_text: "Explore Brand",
        button_url: "/shop",
        image_url: "https://images.pexels.com/photos/30271002/pexels-photo-30271002.jpeg",
        image_public_id: "",
        status: "published",
      });
      console.log("✓ Seeded default about section.");
    } else {
      console.log("✓ About section already exists.");
    }

    // 5. Seed default Lookbook
    const lookbookCount = await Lookbook.countDocuments();
    if (lookbookCount === 0) {
      await Lookbook.insertMany([
        { look_key: "mens", title: "Men's Opticals", image_url: "https://i.pinimg.com/1200x/bd/c2/90/bdc2901ba727dcc2372f247696e8b002.jpg", image_public_id: "" },
        { look_key: "womens", title: "Women's Opticals", image_url: "https://x8.adencys.com/img/promotions.jpg", image_public_id: "" },
      ]);
      console.log("✓ Seeded default lookbook rows.");
    } else {
      console.log("✓ Lookbook rows already exist.");
    }

    // 6. Seed default Campaign Section
    const campaignCount = await CampaignSection.countDocuments();
    if (campaignCount === 0) {
      await CampaignSection.create({
        video_url: "/assets/h4.mkv",
        slides: [
          {
            tag: "CAMPAIGN 2026",
            heading: "SEE THE WORLD DIFFERENTLY.",
            paragraph: "Crafted for those who embrace individuality, creativity and modern luxury.",
          },
          {
            tag: "THE VISION",
            heading: "BEYOND THE ORDINARY.",
            paragraph: "Precision-engineered design that blends seamlessly with your daily lifestyle.",
          },
          {
            tag: "THE CRAFT",
            heading: "TIMELESS ELEGANCE.",
            paragraph: "Redefining the standards of modern aesthetics for the future explorer.",
          },
        ],
      });
      console.log("✓ Seeded default campaign section.");
    } else {
      console.log("✓ Campaign section already exists.");
    }

    console.log("\n✅ Database initialization complete!");
  } catch (error) {
    console.error("Initialization error:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();

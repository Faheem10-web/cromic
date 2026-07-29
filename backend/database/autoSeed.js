import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { isProductionDatabase } from "./safety.js";

// Import models
import Admin from "../models/Admin.js";
import Category from "../models/Category.js";
import HeroBanner from "../models/HeroBanner.js";
import AboutSection from "../models/AboutSection.js";
import Lookbook from "../models/Lookbook.js";
import Product from "../models/Product.js";
import CampaignSection from "../models/CampaignSection.js";

// Relative import of local products list for seeding
import { products as localProducts } from "../../src/data/products.js";

export async function autoSeed() {
  if (global._hasCompletedAutoSeed) {
    return;
  }
  global._hasCompletedAutoSeed = true;

  // Environment and Production connection check
  if (process.env.NODE_ENV !== "development" || isProductionDatabase(process.env.MONGODB_URI)) {
    console.log("[Database Safety] Auto-seeding blocked: Seeding is disabled in production / live environments.");
    return;
  }

  // Ensure database is completely empty (no products exist)
  try {
    const productCount = await Product.countDocuments();
    if (productCount > 0) {
      console.log("[Database Safety] Auto-seeding skipped: Database is not empty.");
      return;
    }
  } catch (error) {
    console.error("[Database Safety] Failed to check product count during auto-seed:", error.message);
    return;
  }

  console.log("----------------------------------------");
  console.log("Checking database collections for seeding...");

  // 1. Seed or update default Admin credentials
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "cromic@gmail.com";
    const adminPass = process.env.ADMIN_PASSWORD || "cromic123";
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    const existingAdmin = await Admin.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const anyAdmin = await Admin.findOne();
      if (anyAdmin) {
        console.log(`✓ Admin exists in database. Skipping credentials override.`);
      } else {
        await Admin.create({ 
          username: "admin", 
          email: adminEmail, 
          password: hashedPassword 
        });
        console.log(`✓ Seeded default admin: ${adminEmail} / ${adminPass}`);
      }
    } else {
      console.log(`✓ Admin credentials verified: ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error setting up default admin:", error.message);
  }

  // 2. Seed default Categories if empty
  try {
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
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
      console.log("✓ Seeded default categories.");
    } else {
      console.log("✓ Category collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding default categories:", error.message);
  }

  // 3. Seed default Hero Banner if empty
  try {
    const bannerCount = await HeroBanner.countDocuments();
    if (bannerCount === 0) {
      await HeroBanner.create({
        hero_image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1600",
        hero_video: "/assets/hero.mp4",
        title: "THE NEW\nBLACK ARROW",
        subtitle: "The classic PO3269S pairs an all-black finish with a silver-outlined Persol Arrow",
        button_text: "SHOP THE COLLECTION",
        button_link: "/shop",
        banner_order: 0,
        active_status: true,
      });
      console.log("✓ Seeded default hero banner.");
    } else {
      console.log("✓ Hero banners collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding default hero banner:", error.message);
  }

  // 4. Seed default About Section if empty
  try {
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
      console.log("✓ About section collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding default about section:", error.message);
  }

  // 5. Seed default Lookbook if empty
  try {
    const lookbookCount = await Lookbook.countDocuments();
    if (lookbookCount === 0) {
      await Lookbook.insertMany([
        { look_key: "mens", title: "Men's Opticals", image_url: "https://i.pinimg.com/1200x/bd/c2/90/bdc2901ba727dcc2372f247696e8b002.jpg", image_public_id: "" },
        { look_key: "womens", title: "Women's Opticals", image_url: "https://x8.adencys.com/img/promotions.jpg", image_public_id: "" },
      ]);
      console.log("✓ Seeded default lookbooks.");
    } else {
      console.log("✓ Lookbook collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding default lookbook:", error.message);
  }

  // 5.5 Seed default Campaign Section if empty
  try {
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
      console.log("✓ Campaign section collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding default campaign section:", error.message);
  }

  // 6. Seed default Products if empty
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      // Build category name → ObjectId map
      const categories = await Category.find();
      const categoryMap = new Map();
      categories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c._id));

      let seeded = 0;
      for (const prod of localProducts) {
        // Ensure no product duplicates are created by checking SKU
        const sku = `SKU-${prod.id}`;
        const existingProduct = await Product.findOne({ sku });
        if (existingProduct) continue;

        const catKey = prod.category ? prod.category.toLowerCase() : "classic";
        const categoryId = categoryMap.get(catKey) || categoryMap.get("classic") || null;

        const slug =
          prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") +
          "-" +
          prod.id;

        const firstVariant = prod.variants ? Object.values(prod.variants)[0] : null;
        const shortDesc = firstVariant?.description || "";
        const specs = firstVariant?.size || "";

        // Build variants array
        const variantsArray = prod.variants
          ? Object.entries(prod.variants).map(([vKey, vData]) => ({
              variant_key: vKey,
              code: vData.code || "",
              name: vData.name || prod.name,
              color: vData.color || "",
              price: vData.price || prod.price,
              thumb: vData.thumb || "",
              images: Array.isArray(vData.images) ? vData.images : [],
              description: vData.description || "",
              details: vData.details || "",
              size: vData.size || "",
              shipping: vData.shipping || "",
            }))
          : [];

        await Product.create({
          name: prod.name,
          slug,
          description: shortDesc,
          short_description: shortDesc,
          price: prod.price,
          discount_price: null,
          brand: "Cromic",
          sku,
          category_id: categoryId,
          stock: 50,
          status: "published",
          featured: true,
          new_arrival: parseInt(prod.id) % 2 === 0,
          bestseller: parseInt(prod.id) % 3 === 0,
          specifications: specs,
          tags: prod.category || "",
          image: prod.image,
          secondary_image: prod.secondaryImage || prod.image,
          variants: variantsArray,
        });

        seeded++;
      }
      console.log(`✓ Seeded ${seeded} default products.`);
    } else {
      console.log("✓ Product collection is not empty. Skipping seeding.");
    }
  } catch (error) {
    console.error("Error seeding products:", error.message);
  }

  console.log("Database verification and seeding complete.");
  console.log("----------------------------------------");
}

import "../config/env.js";
import mongoose from "mongoose";
import { products as localProducts } from "../../src/data/products.js";
import { isProductionDatabase, patchConnectionSafety } from "./safety.js";

import Category from "../models/Category.js";
import Product from "../models/Product.js";

async function run() {
  const uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === "production") {
    console.error("❌ ERROR: Seeding is strictly forbidden in production (NODE_ENV=production).");
    process.exit(1);
  }
  if (process.env.NODE_ENV !== "development") {
    console.error("❌ ERROR: Seeding is only allowed when NODE_ENV=development.");
    process.exit(1);
  }

  console.log("Connecting to database for seeding...");
  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  // Apply drop restrictions
  patchConnectionSafety();

  try {
    const isProdDb = isProductionDatabase(uri);
    const productCount = await Product.countDocuments();
    const hasForce = process.argv.includes("--force");

    if (isProdDb || productCount > 0) {
      if (!hasForce) {
        console.error("\n❌ DATABASE OVERWRITE PROTECTED");
        if (isProdDb) {
          console.error("- Detected a remote/production-like MongoDB Atlas connection.");
        }
        if (productCount > 0) {
          console.error(`- Database is not empty (${productCount} products found).`);
        }
        console.error("\nTo proceed with seeding, you must explicitly run this script with the --force flag:");
        console.error("  node backend/database/seedProducts.js --force\n");
        await mongoose.disconnect();
        process.exit(1);
      }
      console.warn("\n⚠️ WARNING: Overwriting database records because --force flag is specified.");
      // Authorize query safety bypass for this session in development
      global._allowDestructiveOperations = true;
    }

    // Build category name → ObjectId map
    const categories = await Category.find();
    const categoryMap = new Map();
    categories.forEach((c) => categoryMap.set(c.name.toLowerCase(), c._id));

    // Clear existing products
    await Product.deleteMany({});
    console.log("Cleared existing products.");

    let seeded = 0;
    for (const prod of localProducts) {
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
        sku: `SKU-${prod.id}`,
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

    console.log(`✅ Successfully seeded ${seeded} products into MongoDB!`);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

run();

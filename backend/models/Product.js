import mongoose from "mongoose";
import { optimizeCloudinaryUrl } from "../services/cloudinary.js";

// Variant subdocument — stored as array, formatted as object map in responses
const variantSchema = new mongoose.Schema({
  variant_key: { type: String, required: true },
  code: { type: String, default: "" },
  name: { type: String, default: "" },
  color: { type: String, default: "" },
  price: { type: String, default: "" },
  thumb: { type: String, default: "" },
  images: [{ type: String }],
  description: { type: String, default: "" },
  details: { type: String, default: "" },
  size: { type: String, default: "" },
  shipping: { type: String, default: "" },
}, { _id: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: "" },
  short_description: { type: String, default: "" },
  price: { type: String, required: true },
  discount_price: { type: String, default: null },
  brand: { type: String, default: "Cromic" },
  sku: { type: String, required: true, unique: true, trim: true },
  category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  stock: { type: Number, default: 0 },
  status: { type: String, enum: ["draft", "published"], default: "draft" },
  featured: { type: Boolean, default: false },
  new_arrival: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  specifications: { type: String, default: "" },
  frame_material: { type: String, default: "" },
  lens_technology: { type: String, default: "" },
  warranty: { type: String, default: "" },
  origin: { type: String, default: "" },
  includes: { type: String, default: "" },
  appointment_info: { type: String, default: "" },
  contact_info: { type: String, default: "" },
  tags: { type: String, default: "" },
  image: { type: String, default: "" },
  secondary_image: { type: String, default: "" },
  variants: [variantSchema],
}, { timestamps: true });

// Helper: format a product document into the shape the frontend expects
export const formatProductResponse = (product) => {
  const variantsMap = {};
  if (product.variants && Array.isArray(product.variants)) {
    product.variants.forEach((v) => {
      variantsMap[v.variant_key] = {
        id: String(v._id),
        code: v.code,
        name: v.name,
        color: v.color,
        price: v.price,
        thumb: optimizeCloudinaryUrl(v.thumb),
        images: (v.images || []).map(optimizeCloudinaryUrl),
        description: v.description,
        details: v.details,
        size: v.size,
        shipping: v.shipping,
      };
    });
  }

  // Support both populated and non-populated category with robust fallbacks
  const categoryName =
    product.category_id && typeof product.category_id === "object" && product.category_id.name
      ? product.category_id.name
      : typeof product.category_id === "string"
      ? product.category_id
      : (product.tags || "Classic");

  return {
    id: String(product._id),
    name: product.name,
    slug: product.slug,
    description: product.description,
    short_description: product.short_description,
    price: product.price,
    discount_price: product.discount_price,
    brand: product.brand,
    sku: product.sku,
    category_id: product.category_id,
    category: categoryName,
    stock: product.stock,
    status: product.status,
    featured: product.featured,
    new_arrival: product.new_arrival,
    bestseller: product.bestseller,
    specifications: product.specifications,
    frame_material: product.frame_material,
    lens_technology: product.lens_technology,
    warranty: product.warranty,
    origin: product.origin,
    includes: product.includes,
    appointment_info: product.appointment_info,
    contact_info: product.contact_info,
    tags: product.tags,
    image: optimizeCloudinaryUrl(product.image),
    secondaryImage: optimizeCloudinaryUrl(product.secondary_image),
    variants: variantsMap,
  };
};

// Performance Indexes for common query filters and sorting patterns
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category_id: 1, status: 1 });
productSchema.index({ featured: 1, status: 1 });
productSchema.index({ new_arrival: 1, status: 1 });
productSchema.index({ bestseller: 1, status: 1 });

const Product = mongoose.model("Product", productSchema);
export default Product;


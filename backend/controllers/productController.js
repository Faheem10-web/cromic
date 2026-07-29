import Product, { formatProductResponse } from "../models/Product.js";
import Category from "../models/Category.js";
import { validateProduct } from "../validators/productValidator.js";
import { deleteFromCloudinary, getPublicIdFromUrl } from "../services/cloudinary.js";

// Build variant array from incoming object map (e.g. { tortoise: { code, name, ... } })
const buildVariantsArray = (variantsObj) => {
  if (!variantsObj || typeof variantsObj !== "object") return [];
  return Object.entries(variantsObj).map(([vKey, vData]) => ({
    variant_key: vKey,
    code: vData.code || "",
    name: vData.name || "",
    color: vData.color || "",
    price: vData.price || "",
    thumb: vData.thumb || "",
    images: Array.isArray(vData.images) ? vData.images : [],
    description: vData.description || "",
    details: vData.details || "",
    size: vData.size || "",
    shipping: vData.shipping || "",
  }));
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  const apiStart = Date.now();
  try {
    const {
      page = 1,
      limit = 100,
      search,
      category,
      status,
      featured,
      new_arrival,
      bestseller,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (featured !== undefined) filter.featured = featured === "true" || featured === "1";
    if (new_arrival !== undefined) filter.new_arrival = new_arrival === "true" || new_arrival === "1";
    if (bestseller !== undefined) filter.bestseller = bestseller === "true" || bestseller === "1";

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter: match by slug or name
    if (category) {
      const cat = await Category.findOne({
        $or: [{ slug: category }, { name: category }],
      }).select("_id").lean();
      if (cat) filter.category_id = cat._id;
      else filter.category_id = null; // no match → return empty
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const queryStart = Date.now();
    const products = await Product.find(filter)
      .populate("category_id", "name slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    const queryEnd = Date.now();
    console.log(`[DB Query] getProducts MongoDB query execution took ${queryEnd - queryStart}ms`);

    const formatted = products.map(formatProductResponse);
    
    const apiEnd = Date.now();
    console.log(`[API] getProducts total execution took ${apiEnd - apiStart}ms`);

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get product by ID or Slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  const apiStart = Date.now();
  const { id } = req.params;
  try {
    let product;

    const queryStart = Date.now();
    // Try ObjectId first, then slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate("category_id", "name slug").lean();
    }
    if (!product) {
      product = await Product.findOne({ slug: id }).populate("category_id", "name slug").lean();
    }
    const queryEnd = Date.now();
    console.log(`[DB Query] getProductById MongoDB query execution took ${queryEnd - queryStart}ms`);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const formatted = formatProductResponse(product);
    
    const apiEnd = Date.now();
    console.log(`[API] getProductById total execution took ${apiEnd - apiStart}ms`);

    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin)
export const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      short_description,
      price,
      discount_price,
      brand,
      sku,
      category_id,
      stock,
      status,
      featured,
      new_arrival,
      bestseller,
      specifications,
      frame_material,
      lens_technology,
      warranty,
      origin,
      includes,
      appointment_info,
      contact_info,
      tags,
      image,
      secondary_image,
      variants,
    } = req.body;

    const validation = validateProduct({ name, price, sku, status });
    if (!validation.isValid) {
      return res.status(400).json({ message: "Validation error", errors: validation.errors });
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const product = await Product.create({
      name,
      slug,
      description: description || "",
      short_description: short_description || "",
      price,
      discount_price: discount_price || null,
      brand: brand || "Cromic",
      sku,
      category_id: category_id || null,
      stock: stock || 0,
      status: status || "draft",
      featured: Boolean(featured),
      new_arrival: Boolean(new_arrival),
      bestseller: Boolean(bestseller),
      specifications: specifications || "",
      frame_material: frame_material || "",
      lens_technology: lens_technology || "",
      warranty: warranty || "",
      origin: origin || "",
      includes: includes || "",
      appointment_info: appointment_info || "",
      contact_info: contact_info || "",
      tags: tags || "",
      image: image || "",
      secondary_image: secondary_image || "",
      variants: buildVariantsArray(variants),
    });

    res.status(201).json({ message: "Product created successfully", productId: String(product._id) });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Product SKU already exists" });
    }
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const existing = await Product.findById(id).lean();
    if (!existing) {
      return res.status(404).json({ message: "Product not found" });
    }

    const {
      name,
      description,
      short_description,
      price,
      discount_price,
      brand,
      sku,
      category_id,
      stock,
      status,
      featured,
      new_arrival,
      bestseller,
      specifications,
      frame_material,
      lens_technology,
      warranty,
      origin,
      includes,
      appointment_info,
      contact_info,
      tags,
      image,
      secondary_image,
      variants,
    } = req.body;

    const validation = validateProduct({ name, price, sku, status });
    if (!validation.isValid) {
      return res.status(400).json({ message: "Validation error", errors: validation.errors });
    }

    let slug = existing.slug;
    if (name !== existing.name) {
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      slug = `${baseSlug}-${id.slice(-4)}`;
    }

    await Product.findByIdAndUpdate(
      id,
      {
        name,
        slug,
        description: description || "",
        short_description: short_description || "",
        price,
        discount_price: discount_price || null,
        brand: brand || "Cromic",
        sku,
        category_id: category_id || null,
        stock: stock || 0,
        status: status || "draft",
        featured: Boolean(featured),
        new_arrival: Boolean(new_arrival),
        bestseller: Boolean(bestseller),
        specifications: specifications || "",
        frame_material: frame_material || "",
        lens_technology: lens_technology || "",
        warranty: warranty || "",
        origin: origin || "",
        includes: includes || "",
        appointment_info: appointment_info || "",
        contact_info: contact_info || "",
        tags: tags || "",
        image: image || "",
        secondary_image: secondary_image || "",
        variants: buildVariantsArray(variants),
      },
      { runValidators: true }
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Product SKU already exists" });
    }
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Collect all images associated with this product
    const urls = [];
    if (product.image) urls.push(product.image);
    if (product.secondary_image) urls.push(product.secondary_image);

    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.thumb) urls.push(v.thumb);
        if (v.images && Array.isArray(v.images)) {
          v.images.forEach((img) => urls.push(img));
        }
      });
    }

    // Parse and extract unique public IDs
    const publicIds = [...new Set(urls.map(getPublicIdFromUrl).filter(Boolean))];

    // Delete files from Cloudinary in parallel
    if (publicIds.length > 0) {
      console.log(`Deleting ${publicIds.length} product images from Cloudinary...`);
      await Promise.allSettled(publicIds.map((pid) => deleteFromCloudinary(pid)));
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product and associated images deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate product
// @route   POST /api/products/duplicate/:id
// @access  Private (Admin)
export const duplicateProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const source = await Product.findById(id).lean();
    if (!source) {
      return res.status(404).json({ message: "Product not found" });
    }

    const newSku = `${source.sku}-COPY-${Date.now().toString().slice(-4)}`;
    const newName = `${source.name} (Copy)`;
    const baseSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const newSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const duplicate = await Product.create({
      name: newName,
      slug: newSlug,
      description: source.description,
      short_description: source.short_description,
      price: source.price,
      discount_price: source.discount_price,
      brand: source.brand,
      sku: newSku,
      category_id: source.category_id,
      stock: source.stock,
      status: "draft",
      featured: source.featured,
      new_arrival: source.new_arrival,
      bestseller: source.bestseller,
      specifications: source.specifications,
      tags: source.tags,
      image: source.image,
      secondary_image: source.secondary_image,
      variants: source.variants.map((v) => ({
        variant_key: v.variant_key,
        code: v.code,
        name: v.name,
        color: v.color,
        price: v.price,
        thumb: v.thumb,
        images: [...v.images],
        description: v.description,
        details: v.details,
        size: v.size,
        shipping: v.shipping,
      })),
    });

    res.status(201).json({
      message: "Product duplicated successfully as draft",
      duplicateProductId: String(duplicate._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res, next) => {
  const apiStart = Date.now();
  try {
    const { q, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!q) {
      return res.json({ products: [], total: 0 });
    }

    const regex = { $regex: q, $options: "i" };
    const filter = {
      status: "published",
      $or: [{ name: regex }, { brand: regex }, { sku: regex }, { tags: regex }],
    };

    const queryStart = Date.now();
    const [total, productDocs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .populate("category_id", "name slug")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
    ]);
    const queryEnd = Date.now();
    console.log(`[DB Query] searchProducts MongoDB queries execution took ${queryEnd - queryStart}ms`);

    const formattedProducts = productDocs.map(formatProductResponse);

    const apiEnd = Date.now();
    console.log(`[API] searchProducts total execution took ${apiEnd - apiStart}ms`);

    res.json({
      products: formattedProducts,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    next(error);
  }
};

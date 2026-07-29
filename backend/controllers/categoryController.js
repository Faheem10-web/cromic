import Category from "../models/Category.js";
import { getCache, setCache, clearCache } from "../services/cache.js";
import { validateCategory } from "../validators/productValidator.js";
import { deleteFromCloudinary, getPublicIdFromUrl, optimizeCloudinaryUrl } from "../services/cloudinary.js";

// Helper: convert Mongoose doc to plain response object
const toResponse = (doc) => ({
  id: String(doc._id),
  name: doc.name,
  slug: doc.slug,
  description: doc.description,
  image: optimizeCloudinaryUrl(doc.image),
  logo: optimizeCloudinaryUrl(doc.logo || ""),
  status: doc.status,
  created_at: doc.createdAt,
});

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const cacheKey = `categories_${status || "all"}`;
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const filter = {};
    if (status) filter.status = status;

    const categories = await Category.find(filter)
      .select("name slug description image logo status createdAt")
      .sort({ name: 1 })
      .lean();

    const formatted = categories.map(toResponse);
    setCache(cacheKey, formatted, 300000);
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
export const getCategoryById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id).lean();
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(toResponse(category));
  } catch (error) {
    next(error);
  }
};

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req, res, next) => {
  const { name, slug, description, image, logo, status } = req.body;

  try {
    const validation = validateCategory({ name, slug });
    if (!validation.isValid) {
      return res.status(400).json({ message: "Validation error", errors: validation.errors });
    }

    const category = await Category.create({
      name,
      slug,
      description: description || "",
      image: image || "",
      logo: logo || "",
      status: status || "active",
    });

    // Clear categories cache
    clearCache("categories");

    res.status(201).json(toResponse(category));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category slug already exists" });
    }
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req, res, next) => {
  const { id } = req.params;
  const { name, slug, description, image, logo, status } = req.body;

  try {
    const validation = validateCategory({ name, slug });
    if (!validation.isValid) {
      return res.status(400).json({ message: "Validation error", errors: validation.errors });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name, slug, description: description || "", image: image || "", logo: logo || "", status: status || "active" },
      { new: true, runValidators: true }
    ).lean();

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Clear categories cache
    clearCache("categories");

    res.json(toResponse(category));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Category slug already exists" });
    }
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res, next) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const urls = [];
    if (category.image) urls.push(category.image);
    if (category.logo) urls.push(category.logo);

    const publicIds = urls.map(getPublicIdFromUrl).filter(Boolean);
    if (publicIds.length > 0) {
      console.log(`Deleting ${publicIds.length} category images from Cloudinary...`);
      await Promise.allSettled(publicIds.map((pid) => deleteFromCloudinary(pid)));
    }

    await Category.findByIdAndDelete(id);

    // Clear categories cache
    clearCache("categories");

    res.json({ message: "Category and associated images deleted successfully" });
  } catch (error) {
    next(error);
  }
};

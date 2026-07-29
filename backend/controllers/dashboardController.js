import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { getCache, setCache, clearCache } from "../services/cache.js";
import Admin from "../models/Admin.js";
import HeroBanner from "../models/HeroBanner.js";
import { deleteFromCloudinary, getPublicIdFromUrl, optimizeCloudinaryUrl } from "../services/cloudinary.js";

const bannerToResponse = (doc) => ({
  id: String(doc._id),
  hero_image: optimizeCloudinaryUrl(doc.hero_image),
  hero_video: doc.hero_video,
  title: doc.title,
  subtitle: doc.subtitle,
  button_text: doc.button_text,
  button_link: doc.button_link,
  banner_order: doc.banner_order,
  active_status: doc.active_status,
  created_at: doc.createdAt,
});

// @desc    Get dashboard stats
// @route   GET /api/dashboard
// @access  Private (Admin)
export const getStats = async (req, res, next) => {
  try {
    const [totalProducts, totalCategories, totalAdmins] = await Promise.all([
      Product.countDocuments(),
      Category.countDocuments(),
      Admin.countDocuments(),
    ]);

    res.json({
      totalProducts,
      totalCategories,
      totalOrders: 0,
      totalUsers: totalAdmins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all hero banners
// @route   GET /api/dashboard/hero
// @access  Public
export const getHeroBanners = async (req, res, next) => {
  try {
    const cacheKey = "hero_banners";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const banners = await HeroBanner.find().sort({ banner_order: 1 }).lean();
    const formatted = banners.map(bannerToResponse);
    setCache(cacheKey, formatted, 300000);
    res.json(formatted);
  } catch (error) {
    next(error);
  }
};

// @desc    Create hero banner
// @route   POST /api/dashboard/hero
// @access  Private (Admin)
export const createHeroBanner = async (req, res, next) => {
  const { hero_image, hero_video, title, subtitle, button_text, button_link, banner_order, active_status } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: "Banner title is required" });
    }

    const banner = await HeroBanner.create({
      hero_image: hero_image || null,
      hero_video: hero_video || null,
      title,
      subtitle: subtitle || "",
      button_text: button_text || "",
      button_link: button_link || "",
      banner_order: banner_order || 0,
      active_status: active_status === undefined ? true : Boolean(active_status),
    });

    // Clear hero cache
    clearCache("hero");

    res.status(201).json(bannerToResponse(banner));
  } catch (error) {
    next(error);
  }
};

// @desc    Update hero banner
// @route   PUT /api/dashboard/hero/:id
// @access  Private (Admin)
export const updateHeroBanner = async (req, res, next) => {
  const { id } = req.params;
  const { hero_image, hero_video, title, subtitle, button_text, button_link, banner_order, active_status } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ message: "Banner title is required" });
    }

    const banner = await HeroBanner.findByIdAndUpdate(
      id,
      {
        hero_image: hero_image || null,
        hero_video: hero_video || null,
        title,
        subtitle: subtitle || "",
        button_text: button_text || "",
        button_link: button_link || "",
        banner_order: banner_order || 0,
        active_status: active_status === undefined ? true : Boolean(active_status),
      },
      { new: true, runValidators: true }
    ).lean();

    if (!banner) {
      return res.status(404).json({ message: "Hero banner not found" });
    }

    // Clear hero cache
    clearCache("hero");

    res.json(bannerToResponse(banner));
  } catch (error) {
    next(error);
  }
};

// @desc    Delete hero banner
// @route   DELETE /api/dashboard/hero/:id
// @access  Private (Admin)
export const deleteHeroBanner = async (req, res, next) => {
  const { id } = req.params;
  try {
    const banner = await HeroBanner.findById(id);
    if (!banner) {
      return res.status(404).json({ message: "Hero banner not found" });
    }

    const urls = [];
    if (banner.hero_image) urls.push(banner.hero_image);
    if (banner.hero_video) urls.push(banner.hero_video);

    const publicIds = urls.map(getPublicIdFromUrl).filter(Boolean);
    if (publicIds.length > 0) {
      console.log(`Deleting ${publicIds.length} banner media from Cloudinary...`);
      await Promise.allSettled(publicIds.map((pid) => deleteFromCloudinary(pid)));
    }

    await HeroBanner.findByIdAndDelete(id);

    // Clear hero cache
    clearCache("hero");

    res.json({ message: "Hero banner and associated media deleted successfully" });
  } catch (error) {
    next(error);
  }
};

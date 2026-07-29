import Lookbook from "../models/Lookbook.js";
import { getCache, setCache, clearCache } from "../services/cache.js";
import { optimizeCloudinaryUrl } from "../services/cloudinary.js";

const defaultMenImages = [
  "https://i.pinimg.com/1200x/ef/bf/7f/efbf7f315360dfeb44b5837f937a5fe.jpg",
  "https://i.pinimg.com/1200x/b1/48/0b/b1480b502149be9afc8769b976086b24.jpg",
  "https://i.pinimg.com/736x/16/e3/c8/16e3c803108b8b4f8a29347376d1ff18.jpg",
  "https://i.pinimg.com/1200x/f2/7a/d0/f27ad0e1535c849592443b189441a239.jpg"
];

const defaultWomenImages = [
  "https://res.cloudinary.com/ddluoarzr/image/upload/f_auto,q_auto/v1784856533/c1e3097c27038e2dffbe9f518e227289_fy23o6.jpg",
  "https://i.pinimg.com/736x/21/6b/c4/216bc4440041891f2c1829749206590e.jpg",
  "https://i.pinimg.com/1200x/dd/1d/64/dd1d648053c844d679ab23349818f7c6.jpg",
  "https://i.pinimg.com/1200x/ba/d6/d8/bad6d85eb2ee5bdf24f3dead62767225.jpg"
];

// @desc    Get lookbook content
// @route   GET /api/lookbook
// @access  Public
export const getLookbook = async (req, res, next) => {
  try {
    const items = await Lookbook.find().sort({ createdAt: 1 }).lean();
    const optimized = items.map(item => {
      const isMens = item.look_key === "mens";
      const defaultFallback = isMens ? defaultMenImages : defaultWomenImages;

      const rawImages = (Array.isArray(item.images) && item.images.filter(Boolean).length >= 2)
        ? item.images.filter(Boolean)
        : defaultFallback;

      const optImages = rawImages.map(img => optimizeCloudinaryUrl(img));

      return {
        ...item,
        image_url: optImages[0],
        images: optImages
      };
    });
    
    res.json(optimized.length > 0 ? optimized : [
      { look_key: "mens", title: "Men's Opticals", image_url: defaultMenImages[0], images: defaultMenImages },
      { look_key: "womens", title: "Women's Opticals", image_url: defaultWomenImages[0], images: defaultWomenImages }
    ]);
  } catch (error) {
    next(error);
  }
};

// @desc    Update lookbook row
// @route   PUT /api/lookbook/:look_key
// @access  Private (Admin)
export const updateLookbook = async (req, res, next) => {
  const { look_key } = req.params;
  const { title, image_url, images, image_public_id } = req.body;

  try {
    const cleanImages = Array.isArray(images) ? images.filter(Boolean) : (image_url ? [image_url] : []);
    const mainImageUrl = cleanImages[0] || image_url;

    if (!title || !mainImageUrl) {
      return res.status(400).json({ message: "Title and at least one Image URL are required" });
    }

    const item = await Lookbook.findOneAndUpdate(
      { look_key },
      { 
        title, 
        image_url: mainImageUrl, 
        images: cleanImages, 
        image_public_id: image_public_id || "" 
      },
      { new: true, runValidators: true, upsert: true }
    ).lean();

    // Clear lookbook cache
    clearCache("lookbook");

    res.json({ message: "Lookbook updated successfully", data: item });
  } catch (error) {
    next(error);
  }
};

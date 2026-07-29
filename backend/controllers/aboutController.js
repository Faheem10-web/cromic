import AboutSection from "../models/AboutSection.js";
import { getCache, setCache, clearCache } from "../services/cache.js";
import { optimizeCloudinaryUrl } from "../services/cloudinary.js";

const DEFAULT_ABOUT = {
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
};

// @desc    Get about section content
// @route   GET /api/about
// @access  Public
export const getAbout = async (req, res, next) => {
  try {
    const cacheKey = "about";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const about = await AboutSection.findOne().sort({ createdAt: 1 }).lean();
    if (!about) {
      const defaultAbout = {
        ...DEFAULT_ABOUT,
        image_url: optimizeCloudinaryUrl(DEFAULT_ABOUT.image_url)
      };
      setCache(cacheKey, defaultAbout, 300000);
      return res.json(defaultAbout);
    }
    about.image_url = optimizeCloudinaryUrl(about.image_url);
    setCache(cacheKey, about, 300000);
    res.json(about);
  } catch (error) {
    next(error);
  }
};

// @desc    Update about section content
// @route   PUT /api/about
// @access  Private (Admin)
export const updateAbout = async (req, res, next) => {
  const {
    label,
    heading_line_1,
    heading_line_2,
    highlighted_word,
    description,
    button_text,
    button_url,
    image_url,
    image_public_id,
    status,
  } = req.body;

  try {
    if (!label || !heading_line_1 || !heading_line_2 || !highlighted_word || !description) {
      return res.status(400).json({ message: "Label, Heading Lines, Highlighted Word and Description are required" });
    }

    const updateData = {
      label,
      heading_line_1,
      heading_line_2,
      highlighted_word,
      description,
      button_text: button_text || "",
      button_url: button_url || "",
      image_url: image_url || "",
      image_public_id: image_public_id || "",
      status: status || "published",
    };

    // Upsert: update the single about doc, or create it if it doesn't exist
    const about = await AboutSection.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Clear about cache
    clearCache("about");

    res.json({ message: "About section updated successfully", data: about });
  } catch (error) {
    next(error);
  }
};

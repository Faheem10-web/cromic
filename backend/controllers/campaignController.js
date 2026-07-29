import CampaignSection from "../models/CampaignSection.js";
import { getCache, setCache, clearCache } from "../services/cache.js";

const DEFAULT_CAMPAIGN = {
  video_url: "/assets/h4.mkv",
  video_thumbnail_url: "https://i.pinimg.com/736x/38/db/59/38db59fe904bcf6478757288c3e82aca.jpg",
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
};

// @desc    Get campaign section data
// @route   GET /api/campaign
// @access  Public
export const getCampaign = async (req, res, next) => {
  try {
    const cacheKey = "campaign";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const campaign = await CampaignSection.findOne().sort({ createdAt: 1 }).lean();
    if (!campaign) {
      setCache(cacheKey, DEFAULT_CAMPAIGN, 300000);
      return res.json(DEFAULT_CAMPAIGN);
    }
    setCache(cacheKey, campaign, 300000);
    res.json(campaign);
  } catch (error) {
    next(error);
  }
};

// @desc    Update campaign section content
// @route   PUT /api/campaign
// @access  Private (Admin)
export const updateCampaign = async (req, res, next) => {
  const { video_url, video_thumbnail_url, slides } = req.body;

  try {
    if (!video_url || !Array.isArray(slides) || slides.length !== 3) {
      return res.status(400).json({ message: "video_url and exactly 3 slides are required" });
    }

    // Validate structure of slides
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide.tag || !slide.heading || !slide.paragraph) {
        return res.status(400).json({ message: `Slide #${i + 1} has missing required fields` });
      }
    }

    const updateData = {
      video_url,
      video_thumbnail_url: video_thumbnail_url || "",
      slides,
    };

    // Upsert: update the single campaign doc or create it
    const campaign = await CampaignSection.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Clear campaign cache
    clearCache("campaign");

    res.json({ message: "Campaign section updated successfully", data: campaign });
  } catch (error) {
    next(error);
  }
};

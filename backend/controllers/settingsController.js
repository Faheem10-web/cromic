import PageSettings from "../models/PageSettings.js";
import { getCache, setCache, clearCache } from "../services/cache.js";

const DEFAULT_SETTINGS = {
  frame_material: "Premium Cellulose Acetate",
  lens_technology: "100% UVA/UVB Protection",
  warranty: "2-Year International Warranty",
  origin: "Handcrafted in Italy",
  includes: "Premium leather case, microfiber cloth",

  shipping_standard_title: "Complimentary Delivery",
  shipping_standard_desc: "Free standard shipping on all orders, securely packaged in our signature luxury box.",
  shipping_express_title: "Shipping Options",
  shipping_express_desc: "Standard (3-5 business days) — Complimentary\nExpress (1-2 business days) — $15.00",
  returns_title: "Returns",
  returns_desc: "Returns accepted within 30 days in original packaging with security seals intact.",

  appointment_title: "Book an Appointment",
  appointment_desc: "Experience our signature in-store styling service with a dedicated client advisor.",
  appointment_how: "Call us at +1 (800) 555-CROMIC Monday–Saturday: 9AM–6PM EST, or email concierge@cromic.com",

  contact_phone: "+1 (800) 555-CROMIC",
  contact_hours: "Monday – Saturday: 9:00 AM – 6:00 PM EST",
  contact_email: "concierge@cromic.com",
  contact_response: "We respond within 24 hours.",
  enable_image_hover: true,
  hero_slide_interval: 8,
  favicon_url: "/favicon.svg",
  favicon_public_id: "",

  // Dynamic Site Settings Controls
  theme_mode: "user-controlled",
  enable_smooth_scroll: true,
  enable_page_loader: true,
  enable_typing_animation: true,
  enable_cursor_effect: true,
  enable_section_animations: true,
  navbar_sticky_mode: true,
  navbar_black_background: true,
  show_navbar_theme_toggle: true,
  show_social_links: true,
  show_hero_primary_cta: true,
  show_hero_secondary_cta: true,
  enable_contact_form: true,

  // Footer Content Defaults
  footer_newsletter_title: "JOIN THE LIST. STAY AHEAD.",
  footer_email: "info@anima.com",
  footer_social_instagram: "https://instagram.com",
  footer_social_pinterest: "https://pinterest.com",
  footer_copyright: "ANIMA® 2026",
  footer_tagline: "Crafted For Those Who See Differently.",
  footer_contact_title: "GET IN TOUCH",
  footer_connect_title: "CONNECT",
  footer_content_title: "CONTENT",
  footer_legal_title: "LEGAL"
};

// @desc    Get page settings
// @route   GET /api/settings
// @access  Public
export const getSettings = async (req, res, next) => {
  try {
    const cacheKey = "settings";
    const cached = getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    const settings = await PageSettings.findOne().sort({ createdAt: 1 }).lean();
    if (!settings) {
      setCache(cacheKey, DEFAULT_SETTINGS, 300000);
      return res.json(DEFAULT_SETTINGS);
    }
    setCache(cacheKey, settings, 300000);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update page settings
// @route   PUT /api/settings
// @access  Private (Admin)
export const updateSettings = async (req, res, next) => {
  try {
    const updateData = {
      frame_material: req.body.frame_material || DEFAULT_SETTINGS.frame_material,
      lens_technology: req.body.lens_technology || DEFAULT_SETTINGS.lens_technology,
      warranty: req.body.warranty || DEFAULT_SETTINGS.warranty,
      origin: req.body.origin || DEFAULT_SETTINGS.origin,
      includes: req.body.includes || DEFAULT_SETTINGS.includes,

      shipping_standard_title: req.body.shipping_standard_title || DEFAULT_SETTINGS.shipping_standard_title,
      shipping_standard_desc: req.body.shipping_standard_desc || DEFAULT_SETTINGS.shipping_standard_desc,
      shipping_express_title: req.body.shipping_express_title || DEFAULT_SETTINGS.shipping_express_title,
      shipping_express_desc: req.body.shipping_express_desc || DEFAULT_SETTINGS.shipping_express_desc,
      returns_title: req.body.returns_title || DEFAULT_SETTINGS.returns_title,
      returns_desc: req.body.returns_desc || DEFAULT_SETTINGS.returns_desc,

      appointment_title: req.body.appointment_title || DEFAULT_SETTINGS.appointment_title,
      appointment_desc: req.body.appointment_desc || DEFAULT_SETTINGS.appointment_desc,
      appointment_how: req.body.appointment_how || DEFAULT_SETTINGS.appointment_how,

      contact_phone: req.body.contact_phone || DEFAULT_SETTINGS.contact_phone,
      contact_hours: req.body.contact_hours || DEFAULT_SETTINGS.contact_hours,
      contact_email: req.body.contact_email || DEFAULT_SETTINGS.contact_email,
      contact_response: req.body.contact_response || DEFAULT_SETTINGS.contact_response,
      enable_image_hover: req.body.enable_image_hover !== undefined ? req.body.enable_image_hover : DEFAULT_SETTINGS.enable_image_hover,
      hero_slide_interval: req.body.hero_slide_interval !== undefined ? req.body.hero_slide_interval : DEFAULT_SETTINGS.hero_slide_interval,
      favicon_url: req.body.favicon_url || DEFAULT_SETTINGS.favicon_url,
      favicon_public_id: req.body.favicon_public_id !== undefined ? req.body.favicon_public_id : DEFAULT_SETTINGS.favicon_public_id,

      // Dynamic Site Settings Controls
      theme_mode: req.body.theme_mode || DEFAULT_SETTINGS.theme_mode,
      enable_smooth_scroll: req.body.enable_smooth_scroll !== undefined ? req.body.enable_smooth_scroll : DEFAULT_SETTINGS.enable_smooth_scroll,
      enable_page_loader: req.body.enable_page_loader !== undefined ? req.body.enable_page_loader : DEFAULT_SETTINGS.enable_page_loader,
      enable_typing_animation: req.body.enable_typing_animation !== undefined ? req.body.enable_typing_animation : DEFAULT_SETTINGS.enable_typing_animation,
      enable_cursor_effect: req.body.enable_cursor_effect !== undefined ? req.body.enable_cursor_effect : DEFAULT_SETTINGS.enable_cursor_effect,
      enable_section_animations: req.body.enable_section_animations !== undefined ? req.body.enable_section_animations : DEFAULT_SETTINGS.enable_section_animations,
      navbar_sticky_mode: req.body.navbar_sticky_mode !== undefined ? req.body.navbar_sticky_mode : DEFAULT_SETTINGS.navbar_sticky_mode,
      navbar_black_background: req.body.navbar_black_background !== undefined ? req.body.navbar_black_background : DEFAULT_SETTINGS.navbar_black_background,
      show_navbar_theme_toggle: req.body.show_navbar_theme_toggle !== undefined ? req.body.show_navbar_theme_toggle : DEFAULT_SETTINGS.show_navbar_theme_toggle,
      show_social_links: req.body.show_social_links !== undefined ? req.body.show_social_links : DEFAULT_SETTINGS.show_social_links,
      show_hero_primary_cta: req.body.show_hero_primary_cta !== undefined ? req.body.show_hero_primary_cta : DEFAULT_SETTINGS.show_hero_primary_cta,
      show_hero_secondary_cta: req.body.show_hero_secondary_cta !== undefined ? req.body.show_hero_secondary_cta : DEFAULT_SETTINGS.show_hero_secondary_cta,
      enable_contact_form: req.body.enable_contact_form !== undefined ? req.body.enable_contact_form : DEFAULT_SETTINGS.enable_contact_form,

      // Footer Content Settings Mappings
      footer_newsletter_title: req.body.footer_newsletter_title !== undefined ? req.body.footer_newsletter_title : DEFAULT_SETTINGS.footer_newsletter_title,
      footer_email: req.body.footer_email !== undefined ? req.body.footer_email : DEFAULT_SETTINGS.footer_email,
      footer_social_instagram: req.body.footer_social_instagram !== undefined ? req.body.footer_social_instagram : DEFAULT_SETTINGS.footer_social_instagram,
      footer_social_pinterest: req.body.footer_social_pinterest !== undefined ? req.body.footer_social_pinterest : DEFAULT_SETTINGS.footer_social_pinterest,
      footer_copyright: req.body.footer_copyright !== undefined ? req.body.footer_copyright : DEFAULT_SETTINGS.footer_copyright,
      footer_tagline: req.body.footer_tagline !== undefined ? req.body.footer_tagline : DEFAULT_SETTINGS.footer_tagline,
      footer_contact_title: req.body.footer_contact_title !== undefined ? req.body.footer_contact_title : DEFAULT_SETTINGS.footer_contact_title,
      footer_connect_title: req.body.footer_connect_title !== undefined ? req.body.footer_connect_title : DEFAULT_SETTINGS.footer_connect_title,
      footer_content_title: req.body.footer_content_title !== undefined ? req.body.footer_content_title : DEFAULT_SETTINGS.footer_content_title,
      footer_legal_title: req.body.footer_legal_title !== undefined ? req.body.footer_legal_title : DEFAULT_SETTINGS.footer_legal_title
    };

    const settings = await PageSettings.findOneAndUpdate(
      {},
      updateData,
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Clear memory cache
    clearCache("settings");

    res.json({ message: "Product details accordion settings updated successfully", data: settings });
  } catch (error) {
    next(error);
  }
};

import mongoose from "mongoose";

const pageSettingsSchema = new mongoose.Schema({
  // Specifications
  frame_material: { type: String, default: "Premium Cellulose Acetate" },
  lens_technology: { type: String, default: "100% UVA/UVB Protection" },
  warranty: { type: String, default: "2-Year International Warranty" },
  origin: { type: String, default: "Handcrafted in Italy" },
  includes: { type: String, default: "Premium leather case, microfiber cloth" },

  // Shipping
  shipping_standard_title: { type: String, default: "Complimentary Delivery" },
  shipping_standard_desc: { type: String, default: "Free standard shipping on all orders, securely packaged in our signature luxury box." },
  shipping_express_title: { type: String, default: "Shipping Options" },
  shipping_express_desc: { type: String, default: "Standard (3-5 business days) — Complimentary\nExpress (1-2 business days) — $15.00" },
  returns_title: { type: String, default: "Returns" },
  returns_desc: { type: String, default: "Returns accepted within 30 days in original packaging with security seals intact." },

  // Appointment
  appointment_title: { type: String, default: "Book an Appointment" },
  appointment_desc: { type: String, default: "Experience our signature in-store styling service with a dedicated client advisor." },
  appointment_how: { type: String, default: "Call us at +1 (800) 555-CROMIC Monday–Saturday: 9AM–6PM EST, or email concierge@cromic.com" },

  // Contact
  contact_phone: { type: String, default: "+1 (800) 555-CROMIC" },
  contact_hours: { type: String, default: "Monday – Saturday: 9:00 AM – 6:00 PM EST" },
  contact_email: { type: String, default: "concierge@cromic.com" },
  contact_response: { type: String, default: "We respond within 24 hours." },

  // General Settings
  enable_image_hover: { type: Boolean, default: true },
  hero_slide_interval: { type: Number, default: 8 },
  favicon_url: { type: String, default: "/favicon.svg" },
  favicon_public_id: { type: String, default: "" },

  // Dynamic Site Settings Controls
  theme_mode: { type: String, default: "user-controlled" },
  enable_smooth_scroll: { type: Boolean, default: true },
  enable_page_loader: { type: Boolean, default: true },
  enable_typing_animation: { type: Boolean, default: true },
  enable_cursor_effect: { type: Boolean, default: true },
  enable_section_animations: { type: Boolean, default: true },
  navbar_sticky_mode: { type: Boolean, default: true },
  navbar_black_background: { type: Boolean, default: true },
  show_navbar_theme_toggle: { type: Boolean, default: true },
  show_social_links: { type: Boolean, default: true },
  show_hero_primary_cta: { type: Boolean, default: true },
  enable_contact_form: { type: Boolean, default: true },
  
  // Footer Content Settings
  footer_newsletter_title: { type: String, default: "JOIN THE LIST. STAY AHEAD." },
  footer_email: { type: String, default: "info@anima.com" },
  footer_social_instagram: { type: String, default: "https://instagram.com" },
  footer_social_pinterest: { type: String, default: "https://pinterest.com" },
  footer_copyright: { type: String, default: "ANIMA® 2026" },
  footer_tagline: { type: String, default: "Crafted For Those Who See Differently." },
  footer_contact_title: { type: String, default: "GET IN TOUCH" },
  footer_connect_title: { type: String, default: "CONNECT" },
  footer_content_title: { type: String, default: "CONTENT" },
  footer_legal_title: { type: String, default: "LEGAL" }
}, { timestamps: true });

const PageSettings = mongoose.model("PageSettings", pageSettingsSchema);
export default PageSettings;

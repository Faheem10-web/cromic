import mongoose from "mongoose";

const heroBannerSchema = new mongoose.Schema({
  hero_image: { type: String, default: null },
  hero_video: { type: String, default: null },
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  button_text: { type: String, default: "" },
  button_link: { type: String, default: "" },
  banner_order: { type: Number, default: 0 },
  active_status: { type: Boolean, default: true },
}, { timestamps: true });

const HeroBanner = mongoose.model("HeroBanner", heroBannerSchema);
export default HeroBanner;

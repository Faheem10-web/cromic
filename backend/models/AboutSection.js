import mongoose from "mongoose";

const aboutSectionSchema = new mongoose.Schema({
  label: { type: String, required: true, default: "OUR STORY" },
  heading_line_1: { type: String, required: true, default: "Crafted" },
  heading_line_2: { type: String, required: true, default: "Beyond" },
  highlighted_word: { type: String, required: true, default: "Vision" },
  description: { type: String, required: true, default: "" },
  button_text: { type: String, default: "" },
  button_url: { type: String, default: "" },
  image_url: { type: String, default: "" },
  image_public_id: { type: String, default: "" },
  status: { type: String, enum: ["draft", "published"], default: "published" },
}, { timestamps: true });

const AboutSection = mongoose.model("AboutSection", aboutSectionSchema);
export default AboutSection;

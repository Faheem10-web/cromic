import mongoose from "mongoose";

const campaignSlideSchema = new mongoose.Schema({
  tag: { type: String, required: true },
  heading: { type: String, required: true },
  paragraph: { type: String, required: true },
  image_url: { type: String, default: "" },
});

const campaignSectionSchema = new mongoose.Schema({
  video_url: { type: String, default: "/assets/h4.mkv" },
  video_thumbnail_url: { type: String, default: "" },
  slides: [campaignSlideSchema],
}, { timestamps: true });

const CampaignSection = mongoose.model("CampaignSection", campaignSectionSchema);
export default CampaignSection;

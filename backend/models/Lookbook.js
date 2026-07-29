import mongoose from "mongoose";

const lookbookSchema = new mongoose.Schema({
  look_key: { type: String, required: true, unique: true, trim: true },
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  images: { type: [String], default: [] },
  image_public_id: { type: String, default: "" },
}, { timestamps: true });

const Lookbook = mongoose.model("Lookbook", lookbookSchema);
export default Lookbook;

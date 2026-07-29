import express from "express";
import multer from "multer";
import { protectAdmin } from "../middleware/auth.js";
import { uploadToCloudinary, deleteFromCloudinary, getPublicIdFromUrl } from "../services/cloudinary.js";
import { validateImageUrl } from "../validators/productValidator.js";

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum upload limit
  },
  fileFilter: (req, file, cb) => {
    // Validate image and video formats
    const allowedMimeTypes = [
      "image/jpeg", "image/jpg", "image/png", "image/webp",
      "video/mp4", "video/webm", "video/quicktime", "video/x-matroska", "video/mpeg"
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Allowed formats: JPG, JPEG, PNG, WEBP, MP4, WEBM, MKV, MOV."));
    }
  },
});

// @desc    Upload image file from computer (Method 1)
// @route   POST /api/upload
// @access  Private (Admin)
router.post("/", protectAdmin, (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ message: "File size exceeds the 10MB upload limit." });
      }
      return res.status(400).json({ message: err.message });
    }

    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      console.log(`Received file upload: ${req.file.originalname}, size: ${req.file.size} bytes`);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(req.file.buffer);
      
      return res.json({
        message: "Image uploaded successfully to Cloudinary",
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      });
    } catch (error) {
      console.error("Upload handler error:", error.message);
      // Fallback: If Cloudinary credentials fail, let's log it but provide a mock URL
      // so the user can still test the interface if they haven't filled credentials yet
      return res.status(500).json({
        message: "Cloudinary upload failed: " + error.message,
        error: error.message
      });
    }
  });
});

// @desc    Validate pasted image URL (Method 2)
// @route   POST /api/upload/validate-url
// @access  Private (Admin)
router.post("/validate-url", protectAdmin, (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: "No image URL provided" });
  }

  const isValid = validateImageUrl(url);
  if (!isValid) {
    return res.status(400).json({ message: "Invalid image URL. Must start with http/https and point to a valid image format." });
  }

  res.json({
    message: "Image URL validated successfully",
    url,
  });
});

// @desc    Delete image from Cloudinary by URL
// @route   POST /api/upload/delete
// @access  Private (Admin)
router.post("/delete", protectAdmin, async (req, res, next) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: "No image URL provided" });
  }

  const publicId = getPublicIdFromUrl(url);
  if (!publicId) {
    return res.status(400).json({ message: "Failed to parse Cloudinary public ID from URL" });
  }

  try {
    // Determine resource type (image or video) from URL
    const resourceType = url.includes("/video/upload/") ? "video" : url.includes("/raw/upload/") ? "raw" : "image";
    const result = await deleteFromCloudinary(publicId, resourceType);
    res.json({ message: "Asset deleted successfully from Cloudinary", result });
  } catch (error) {
    next(error);
  }
});

export default router;

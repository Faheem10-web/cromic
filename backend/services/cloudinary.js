import "../config/env.js";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileBuffer, folder = "cromic") => {
  return new Promise((resolve, reject) => {
    // Check if configuration is set
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME.includes("yoursname")) {
      console.warn("Cloudinary is not configured correctly in .env. Falling back to local/static URLs.");
      return reject(new Error("Cloudinary configuration missing or invalid. Verify credentials in backend/.env file."));
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Stream Error:", error);
          return reject(error);
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) return null;
    const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    return result;
  } catch (error) {
    console.error("Cloudinary Delete Error:", error);
    throw error;
  }
};

export const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return null;
  try {
    const parts = url.split("/upload/");
    if (parts.length < 2) return null;
    
    let path = parts[1];
    
    // Remove version code like v123456789/
    if (path.startsWith("v") && path.includes("/")) {
      const slashIndex = path.indexOf("/");
      const versionStr = path.substring(1, slashIndex);
      if (/^\d+$/.test(versionStr)) {
        path = path.substring(slashIndex + 1);
      }
    }
    
    // Remove extension
    const lastDotIndex = path.lastIndexOf(".");
    if (lastDotIndex > -1) {
      path = path.substring(0, lastDotIndex);
    }
    
    return path;
  } catch (error) {
    console.error("Error parsing Cloudinary URL:", error);
    return null;
  }
};

/**
 * Automatically optimize Cloudinary URLs to request WebP/AVIF format (f_auto)
 * and automatic quality compression (q_auto).
 * @param {string} url The original Cloudinary URL.
 * @returns {string} The optimized URL.
 */
export const optimizeCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string" || !url.includes("res.cloudinary.com")) return url;
  
  // Verify it contains the standard upload path
  if (url.includes("/upload/")) {
    // Avoid double transformations
    if (url.includes("f_auto") || url.includes("q_auto")) return url;
    
    return url.replace("/upload/", "/upload/f_auto,q_auto/");
  }
  return url;
};

export default cloudinary;

// Simple validator helpers

export const validateImageUrl = (url) => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    
    // Check extension or typical image patterns
    return /\.(jpeg|jpg|gif|png|webp|svg)/i.test(parsed.pathname) || 
           parsed.pathname.includes("unsplash.com") || 
           parsed.pathname.includes("pinterest.com") ||
           parsed.pathname.includes("adencys.com") ||
           parsed.pathname.includes("cloudinary.com");
  } catch (_) {
    return false;
  }
};

export const validateProduct = (data) => {
  const errors = [];
  const { name, price, category_id, sku, status } = data;

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Product Name is required and must be a string");
  }
  if (!price || typeof price !== "string" || price.trim() === "") {
    errors.push("Product Price is required (e.g. $245.00)");
  }
  if (!sku || typeof sku !== "string" || sku.trim() === "") {
    errors.push("SKU code is required");
  }
  if (status && !["draft", "published"].includes(status)) {
    errors.push("Status must be either 'draft' or 'published'");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateCategory = (data) => {
  const errors = [];
  const { name, slug } = data;

  if (!name || typeof name !== "string" || name.trim() === "") {
    errors.push("Category Name is required");
  }
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    errors.push("Category slug is required");
  } else if (!/^[a-z0-9-_]+$/.test(slug)) {
    errors.push("Category slug can only contain lowercase letters, numbers, dashes, and underscores");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

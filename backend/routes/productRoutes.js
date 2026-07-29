import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  duplicateProduct,
  searchProducts,
} from "../controllers/productController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/search", searchProducts);
router.get("/:id", getProductById);
router.post("/", protectAdmin, createProduct);
router.put("/:id", protectAdmin, updateProduct);
router.delete("/:id", protectAdmin, deleteProduct);
router.post("/duplicate/:id", protectAdmin, duplicateProduct);

export default router;

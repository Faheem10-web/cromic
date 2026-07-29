import express from "express";
import {
  getStats,
  getHeroBanners,
  createHeroBanner,
  updateHeroBanner,
  deleteHeroBanner,
} from "../controllers/dashboardController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public
router.get("/hero", getHeroBanners);

// Protected Admin
router.get("/stats", protectAdmin, getStats);
router.post("/hero", protectAdmin, createHeroBanner);
router.put("/hero/:id", protectAdmin, updateHeroBanner);
router.delete("/hero/:id", protectAdmin, deleteHeroBanner);

export default router;

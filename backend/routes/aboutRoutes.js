import express from "express";
import { getAbout, updateAbout } from "../controllers/aboutController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getAbout);
router.put("/", protectAdmin, updateAbout);

export default router;

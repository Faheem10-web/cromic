import express from "express";
import { getLookbook, updateLookbook } from "../controllers/lookbookController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getLookbook);
router.put("/:look_key", protectAdmin, updateLookbook);

export default router;

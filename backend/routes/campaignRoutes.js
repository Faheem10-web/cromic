import express from "express";
import { getCampaign, updateCampaign } from "../controllers/campaignController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.get("/", getCampaign);
router.put("/", protectAdmin, updateCampaign);

export default router;

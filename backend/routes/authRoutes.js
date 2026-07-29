import express from "express";
import { login, logout, getProfile } from "../controllers/authController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", protectAdmin, logout);
router.get("/profile", protectAdmin, getProfile);

export default router;

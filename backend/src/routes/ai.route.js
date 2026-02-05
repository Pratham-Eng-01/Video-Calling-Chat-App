import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getSmartReply, generateAvatar } from "../controllers/ai.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/smart-reply", getSmartReply);
router.post("/generate-avatar", generateAvatar);

export default router;

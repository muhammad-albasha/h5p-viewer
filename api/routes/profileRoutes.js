// routes/profileRoutes.js
import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authenticateToken, getProfile);
router.put("/", authenticateToken, updateProfile);

export default router;

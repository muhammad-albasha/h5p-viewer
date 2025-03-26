// routes/authRoutes.js
import { Router } from "express";
import {
  login,
  protectedRoute,
  refreshToken,
} from "../controllers/authController.js";
const router = Router();

router.post("/login", login);
router.get("/protected", protectedRoute);
router.get("/refresh", refreshToken); // Neuer Refresh-Endpunkt

export default router;

import { Router } from "express";
import { login, protectedRoute } from "../controllers/authController.js";
const router = Router();

router.post("/login", login);
router.get("/protected", protectedRoute);

export default router;

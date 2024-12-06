import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// Auth routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", protect, getMe);

export default router;

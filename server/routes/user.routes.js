import e from "express";
const router = e.Router();
import { updateUser } from "../controllers/user.controller.js";
import { protect } from "../Middleware/auth.js";

router.put("/update", protect, updateUser);

export default router;

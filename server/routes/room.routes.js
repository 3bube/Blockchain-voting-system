import express from "express";
const router = express.Router();
import {
  getAccessCodeByVoteId,
  joinRoomByAccessCode,
} from "../controllers/room.controller.js";
import { protect } from "../Middleware/auth.js";

router.get("/:id", protect, getAccessCodeByVoteId);
router.post("/join", protect, joinRoomByAccessCode);

export default router;

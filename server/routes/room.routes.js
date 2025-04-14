import express from "express";
const router = express.Router();
import {
  getAccessCodeByVoteId,
  joinRoomByAccessCode,
  createRoom,
  getAllRooms,
  getRoomById
} from "../controllers/room.controller.js";
import { protect } from "../Middleware/auth.js";

// Get routes
router.get("/all", protect, getAllRooms);
router.get("/vote/:id", protect, getAccessCodeByVoteId);
router.get("/:id", protect, getRoomById);

// Post routes
router.post("/create", protect, createRoom);
router.post("/join", protect, joinRoomByAccessCode);

export default router;

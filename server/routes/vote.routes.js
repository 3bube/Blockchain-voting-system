import express from "express";
import { protect } from "../Middleware/auth.js";
import {
  createVote,
  getAllVotes,
  getVoteByRoomId,
  castVote,
  getUserVotingHistory,
  updateVote,
  endVote,
  deleteVote,
} from "../controllers/vote.controller.js";

const router = express.Router();

// Create a new vote (requires authentication)
router.post("/create", protect, createVote);

// Get all votes
router.get("/all", protect, getAllVotes);

// Get specific vote by ID
router.get("/:id", protect, getVoteByRoomId);

// Cast a vote (requires authentication)
router.post("/:id/cast", protect, castVote);

// Get user's voting history (requires authentication)
router.get("/history", protect, getUserVotingHistory);

router.post("/update/:id", protect, updateVote);

router.post("/end/:id", protect, endVote);

router.delete("/delete/:id", protect, deleteVote);

export default router;

import express from "express";
import voteController from "../controllers/vote.controller.js";
import { protect } from "../Middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Create a new vote
router.post("/create", voteController.createVote.bind(voteController));

// Cast a vote
router.post("/cast", voteController.castVote.bind(voteController));

// Get all votes
router.get("/all", voteController.getVotes.bind(voteController));

// Get specific vote details
router.get(
  "/details/:voteId",
  voteController.getVoteDetails.bind(voteController)
);

// Get vote results
router.get(
  "/results/:voteId",
  voteController.getVoteResults.bind(voteController)
);

// End a vote (only by creator)
router.post("/end/:voteId", voteController.endVote.bind(voteController));

// Manual sync (admin only)
router.post("/sync", voteController.manualSync.bind(voteController));

export default router;

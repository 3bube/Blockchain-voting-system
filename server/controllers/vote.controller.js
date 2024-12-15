import Vote from "../models/vote.models.js";
import Room from "../models/room.models.js";
import User from "../models/user.models.js";

// Create a new vote
export const createVote = async (req, res) => {
  try {
    const {
      title,
      startTime,
      endTime,
      candidates,
      roomName,
      roomDesc,
      maxParticipants,
      accessCode,
    } = req.body;
    const userId = req.user._id;

    // Format candidates array
    const formattedCandidates = candidates.map((name) => ({
      name: name,
      voteCount: 0,
    }));

    // Create and save vote
    const vote = new Vote({
      title,
      startTime,
      endTime,
      candidates: formattedCandidates,
      creator: userId,
    });

    await vote.save();

    const room = new Room({
      name: roomName,
      description: roomDesc,
      creator: userId,
      accessCode: accessCode,
      startTime: startTime,
      endTime: endTime,
      maxParticipants: maxParticipants,
      vote: vote._id,
    });

    await room.save();

    // Update user's voting history
    await User.findByIdAndUpdate(userId, {
      $push: { votingHistory: vote._id },
    });

    res.status(201).json({
      success: true,
      message: "Vote created successfully",
      vote,
    });
  } catch (error) {
    console.error("Vote creation error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating vote",
      error: error.message,
    });
  }
};

// Get all votes
export const getAllVotes = async (req, res) => {
  try {
    const votes = await Vote.find({ status: "new" })
      .populate("creator", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      votes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching votes",
      error: error.message,
    });
  }
};

// Get vote by ID
export const getVoteByRoomId = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("vote");
    const vote = await Vote.findById(room.vote._id).populate(
      "creator",
      "name email"
    );
    res.status(200).json({
      success: true,
      vote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vote",
      error: error.message,
    });
  }
};

// Cast a vote
export const castVote = async (req, res) => {
  try {
    const { candidateIndex } = req.body;
    const voteId = req.params.id;
    const userId = req.user._id;

    console.log(candidateIndex, voteId);

    const vote = await Vote.findById(voteId);

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    // Check if vote is active
    // const now = new Date();
    // if (now < new Date(vote.startTime) || now > new Date(vote.endTime)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Voting is not currently active",
    //   });
    // }

    // Check if user has already voted
    const hasVoted = vote.voters.some(
      (voter) => voter.user.toString() === userId.toString()
    );
    if (hasVoted) {
      return res.status(400).json({
        success: false,
        message: "You have already voted",
      });
    }

    console.log("Has voted:", hasVoted);

    // Check if candidate index is valid
    if (candidateIndex < 0 || candidateIndex >= vote.candidates.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid candidate index",
      });
    }

    // Update vote counts and add voter
    vote.candidates[candidateIndex].voteCount += 1;
    vote.voters.push({
      user: userId,
      votedFor: candidateIndex,
      votedAt: new Date(),
    });

    await vote.save();

    // Update user's voting history
    await User.findByIdAndUpdate(userId, {
      $push: { votingHistory: voteId },
      $inc: { votes: 1 },
    });

    res.status(200).json({
      success: true,
      message: "Vote cast successfully",
      vote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error casting vote",
      error: error.message,
    });
  }
};

// Get user's voting history
export const getUserVotingHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("votingHistory");

    res.status(200).json({
      success: true,
      votingHistory: user.votingHistory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching voting history",
      error: error.message,
    });
  }
};

// update vote
export const updateVote = async (req, res) => {
  try {
    const { title, candidates } = req.body;
    const voteId = req.params.id;

    const updatedVote = await Vote.findByIdAndUpdate(
      voteId,
      { title, candidates },
      { new: true } // Return the updated document
    );

    if (!updatedVote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vote updated successfully",
      vote: updatedVote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating vote",
      error: error.message,
    });
  }
};

// end vote
export const endVote = async (req, res) => {
  try {
    const voteId = req.params.id;

    const vote = await Vote.findById(voteId);

    console.log(vote);
    const room = await Room.findOne({ vote: voteId });

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    vote.status = "closed";
    room.status = "cancelled";

    await vote.save();
    await room.save();

    res.status(200).json({
      success: true,
      message: "Vote ended successfully",
      vote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error ending vote",
      error: error.message,
    });
  }
};

// delete vote
export const deleteVote = async (req, res) => {
  try {
    const voteId = req.params.id;

    const vote = await Vote.findByIdAndDelete(voteId);

    if (!vote) {
      return res.status(404).json({
        success: false,
        message: "Vote not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vote deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting vote",
      error: error.message,
    });
  }
};

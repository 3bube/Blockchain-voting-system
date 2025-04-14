import { ethers } from "ethers";
import mongoose from "mongoose";
import Vote from "../models/vote.models.js";
import MqttController from "./mqtt.controller.js";

const contractABI = [
  {
    inputs: [
      { internalType: "string", name: "_title", type: "string" },
      { internalType: "string", name: "_description", type: "string" },
      { internalType: "string[]", name: "_optionNames", type: "string[]" },
      { internalType: "uint256", name: "_startTime", type: "uint256" },
      { internalType: "uint256", name: "_endTime", type: "uint256" },
      { internalType: "uint256", name: "_maxParticipants", type: "uint256" },
      { internalType: "string", name: "_roomName", type: "string" },
      { internalType: "string", name: "_accessCode", type: "string" },
    ],
    name: "createVote",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      { internalType: "uint256", name: "_optionId", type: "uint256" },
    ],
    name: "castVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "endVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getVoteDetails",
    outputs: [
      { internalType: "string", name: "title", type: "string" },
      { internalType: "string", name: "description", type: "string" },
      { internalType: "uint256", name: "startTime", type: "uint256" },
      { internalType: "uint256", name: "endTime", type: "uint256" },
      { internalType: "bool", name: "isActive", type: "bool" },
      { internalType: "address", name: "creator", type: "address" },
      { internalType: "uint256", name: "maxParticipants", type: "uint256" },
      { internalType: "uint256", name: "currentParticipants", type: "uint256" },
      { internalType: "string", name: "roomName", type: "string" },
      { internalType: "string", name: "accessCode", type: "string" },
      { internalType: "string", name: "status", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
    name: "getVoteResults",
    outputs: [
      { internalType: "string[]", name: "names", type: "string[]" },
      { internalType: "uint256[]", name: "counts", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVotesPart1",
    outputs: [
      { internalType: "uint256[]", name: "voteIds", type: "uint256[]" },
      { internalType: "string[]", name: "titles", type: "string[]" },
      { internalType: "string[]", name: "descriptions", type: "string[]" },
      { internalType: "uint256[]", name: "startTimes", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVotesPart2",
    outputs: [
      { internalType: "uint256[]", name: "endTimes", type: "uint256[]" },
      { internalType: "bool[]", name: "isActives", type: "bool[]" },
      { internalType: "address[]", name: "creators", type: "address[]" },
      { internalType: "uint256[]", name: "maxParticipants", type: "uint256[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVotesPart3",
    outputs: [
      {
        internalType: "uint256[]",
        name: "currentParticipants",
        type: "uint256[]",
      },
      { internalType: "string[]", name: "roomNames", type: "string[]" },
      { internalType: "string[]", name: "accessCodes", type: "string[]" },
      { internalType: "string[]", name: "statuses", type: "string[]" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "voteId", type: "uint256" }],
    name: "getVoteOptions",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "voteCount", type: "uint256" },
        ],
        internalType: "struct VotingSystem.VoteOption[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVoteOptions",
    outputs: [
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "voteCount", type: "uint256" },
        ],
        internalType: "struct VotingSystem.VoteOption[][]",
        name: "",
        type: "tuple[][]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalVotes",
    outputs: [
      { internalType: "uint256", name: "totalVotes", type: "uint256" },
      {
        components: [
          { internalType: "string", name: "name", type: "string" },
          { internalType: "uint256", name: "voteCount", type: "uint256" },
        ],
        internalType: "struct VotingSystem.VoteOption[]",
        name: "options",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      { internalType: "address", name: "_voter", type: "address" },
    ],
    name: "hasUserVoted",
    outputs: [{ internalType: "bool", name: "", type: "bool" }],
    stateMutability: "view",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "voteId",
        type: "uint256",
      },
      { indexed: false, internalType: "string", name: "title", type: "string" },
      {
        indexed: false,
        internalType: "address",
        name: "creator",
        type: "address",
      },
    ],
    name: "VoteCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "voteId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "optionId",
        type: "uint256",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "voteId",
        type: "uint256",
      },
    ],
    name: "VoteEnded",
    type: "event",
  },
];

class VoteController {
  constructor() {
    // Initialize provider
    this.provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    
    // Create a wallet with a private key for transactions
    // This is a development private key - NEVER use hardcoded private keys in production
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // Default hardhat first account
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract with wallet signer
    this.contract = new ethers.Contract(
      "0x73511669fd4dE447feD18BB79bAFeAC93aB7F31f",
      contractABI,
      this.wallet
    );

    // Track system power status
    this.systemPowered = true;

    // Initialize and setup MQTT power monitoring
    this.setupPowerMonitoring();
    
    console.log("VoteController initialized with blockchain connection");
  }

  setupPowerMonitoring() {
    // Subscribe to power cut alerts
    MqttController.onMessage("esp32/power_cut_alert", (message) => {
      const isPowerCut = message === "true";

      // Update system power status
      if (this.systemPowered === isPowerCut) {
        this.systemPowered = !isPowerCut;
        console.log(
          `Power status changed: ${
            this.systemPowered ? "POWER RESTORED" : "POWER CUT"
          }`
        );

        // If power is restored, sync pending votes
        if (this.systemPowered) {
          this.syncPendingVotes();
        }
      }
    });
  }

  async createVote(req, res) {
    try {
      const {
        title,
        description,
        options,
        startTime,
        endTime,
        maxParticipants,
        roomName,
        accessCode,
      } = req.body;

      const creator = req.user._id; // Assuming authentication middleware sets req.user

      console.log(req.body);

      // Validate input
      if (
        !title ||
        !description ||
        !options ||
        !startTime ||
        !endTime ||
        !roomName ||
        !accessCode
      ) {
        return res
          .status(400)
          .json({ error: "Missing required vote information" });
      }

      if (!Array.isArray(options) || options.length < 2) {
        return res
          .status(400)
          .json({ error: "At least 2 options are required" });
      }

      const optionNames = options.map((option) => option.name);

      if (this.systemPowered) {
        try {
          // Create vote on blockchain
          const startTimeUnix = Math.floor(
            new Date(startTime).getTime() / 1000
          );
          const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

          const tx = await this.contract.createVote(
            title,
            description,
            optionNames,
            startTimeUnix,
            endTimeUnix,
            maxParticipants || 1000,
            roomName,
            accessCode
          );

          const receipt = await tx.wait();
          console.log("Transaction receipt:", JSON.stringify(receipt, null, 2));

          // In ethers.js v6, events structure has changed
          // We'll use a more robust approach to extract the vote ID
          let voteId;
          
          // Try different approaches to get the voteId based on ethers.js version
          if (receipt.logs && receipt.logs.length > 0) {
            // Parse the logs manually
            try {
              // The first log is likely our VoteCreated event
              const log = receipt.logs[0];
              const parsedLog = this.contract.interface.parseLog({
                topics: log.topics,
                data: log.data
              });
              
              if (parsedLog && parsedLog.args) {
                voteId = parsedLog.args[0].toString(); // First arg should be voteId
                console.log("Found voteId from parsed log:", voteId);
              }
            } catch (parseError) {
              console.error("Error parsing logs:", parseError);
            }
          }
          
          // If we couldn't get the voteId, generate one for MongoDB
          if (!voteId) {
            voteId = "blockchain_" + new mongoose.Types.ObjectId().toString();
            console.log("Generated fallback voteId:", voteId);
          }

          // Create corresponding MongoDB record for backup and easy querying
          const newVote = new Vote({
            title,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            candidates: optionNames.map((name) => ({ name, voteCount: 0 })),
            creator,
            voters: [],
            status: "new",
            voteId: voteId,
          });

          await newVote.save();

          return res.status(201).json({
            success: true,
            message: "Vote created successfully on blockchain",
            voteId: voteId,
            transactionHash: receipt.transactionHash,
          });
        } catch (error) {
          console.error("Error creating vote on blockchain:", error);
          return res.status(500).json({
            error: "Failed to create vote on blockchain",
            details: error.message,
          });
        }
      } else {
        // Power outage - create vote in MongoDB only and sync later
        const newVote = new Vote({
          title,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          candidates: optionNames.map((name) => ({ name, voteCount: 0 })),
          creator,
          voters: [],
          status: "pending", // Pending status means needs to be synced to blockchain
          voteId: "pending_" + new mongoose.Types.ObjectId().toString(),
        });

        const savedVote = await newVote.save();

        return res.status(201).json({
          success: true,
          message:
            "Power outage detected. Vote created in backup database for later processing.",
          vote: savedVote,
        });
      }
    } catch (error) {
      console.error("Error creating vote:", error);
      return res
        .status(500)
        .json({ error: "Failed to create vote", details: error.message });
    }
  }

  async castVote(req, res) {
    try {
      const { voteId, optionId } = req.body;
      const voter = req.user._id; // Assuming authentication middleware sets req.user

      // Validate input
      if (!voteId || optionId === undefined) {
        return res
          .status(400)
          .json({ error: "Missing required voting information" });
      }

      // Check if the vote exists in MongoDB
      const voteInDb = await Vote.findOne({
        $or: [{ voteId: voteId }, { _id: voteId }],
      });

      if (!voteInDb) {
        return res.status(404).json({ error: "Vote not found" });
      }

      // Check if user has already voted in MongoDB
      const alreadyVotedInDb = voteInDb.voters.some(
        (v) => v.user.toString() === voter.toString()
      );
      if (alreadyVotedInDb) {
        return res.status(400).json({ error: "You have already cast a vote" });
      }

      if (this.systemPowered && !voteInDb.voteId.startsWith("pending_")) {
        try {
          // Check if user has already voted on blockchain
          const hasVotedOnChain = await this.contract.hasUserVoted(
            voteId,
            req.user.walletAddress
          );
          if (hasVotedOnChain) {
            return res.status(400).json({
              error: "You have already cast a vote on the blockchain",
            });
          }

          // Cast vote on blockchain
          const tx = await this.contract.castVote(voteId, optionId);
          const receipt = await tx.wait();

          // Update MongoDB record for consistency
          voteInDb.voters.push({
            user: voter,
            votedFor: optionId,
            votedAt: new Date(),
          });

          // Increment vote count for the chosen option
          voteInDb.candidates[optionId].voteCount += 1;
          await voteInDb.save();

          return res.status(200).json({
            success: true,
            message: "Vote cast successfully on blockchain",
            transactionHash: receipt.transactionHash,
          });
        } catch (error) {
          console.error("Error casting vote on blockchain:", error);

          // If blockchain transaction fails, store in MongoDB for later
          voteInDb.voters.push({
            user: voter,
            votedFor: optionId,
            votedAt: new Date(),
          });
          voteInDb.candidates[optionId].voteCount += 1;
          await voteInDb.save();

          return res.status(200).json({
            success: true,
            message:
              "Vote stored in database due to blockchain transaction failure",
            needsSync: true,
          });
        }
      } else {
        // Power outage or pending vote - store in MongoDB only
        voteInDb.voters.push({
          user: voter,
          votedFor: optionId,
          votedAt: new Date(),
        });
        voteInDb.candidates[optionId].voteCount += 1;
        await voteInDb.save();

        return res.status(200).json({
          success: true,
          message:
            "Power outage detected. Vote stored in backup database for later processing.",
          voteId: voteInDb._id,
        });
      }
    } catch (error) {
      console.error("Error casting vote:", error);
      return res
        .status(500)
        .json({ error: "Failed to cast vote", details: error.message });
    }
  }

  async syncPendingVotes() {
    if (!this.systemPowered) {
      console.log("Cannot sync votes: System power is off");
      return;
    }

    try {
      console.log("Power restored: Starting vote synchronization process...");

      // First, sync any pending vote creations
      const pendingVotes = await Vote.find({
        status: "pending",
        voteId: { $regex: /^pending_/ },
      });

      console.log(
        `Found ${pendingVotes.length} pending vote creations to sync`
      );

      for (const vote of pendingVotes) {
        try {
          // Create vote on blockchain
          const startTimeUnix = Math.floor(
            new Date(vote.startTime).getTime() / 1000
          );
          const endTimeUnix = Math.floor(
            new Date(vote.endTime).getTime() / 1000
          );

          // Extract option names from candidates
          const optionNames = vote.candidates.map(
            (candidate) => candidate.name
          );

          const tx = await this.contract.createVote(
            vote.title,
            "Vote created during power outage", // Default description
            optionNames,
            startTimeUnix,
            endTimeUnix,
            1000, // Default max participants
            "SyncedRoom", // Default room name
            "SyncedAccess" // Default access code
          );

          const receipt = await tx.wait();

          // Find the VoteCreated event to get the vote ID
          const voteCreatedEvent = receipt.events.find(
            (e) => e.event === "VoteCreated"
          );
          const blockchainVoteId = voteCreatedEvent.args.voteId.toString();

          // Update MongoDB record with blockchain vote ID
          vote.voteId = blockchainVoteId;
          vote.status = "new"; // Update status
          await vote.save();

          console.log(
            `Synced vote creation: ${vote._id} -> Blockchain ID: ${blockchainVoteId}`
          );

          // Now sync any votes cast for this vote
          await this.syncVotesCastForVote(vote._id, blockchainVoteId);
        } catch (error) {
          console.error(`Failed to sync vote creation ${vote._id}:`, error);
        }
      }

      // Then, sync any pending votes for already-created blockchain votes
      const activeVotes = await Vote.find({
        status: { $ne: "pending" },
        voteId: { $not: { $regex: /^pending_/ } },
      });

      for (const vote of activeVotes) {
        await this.syncVotesCastForVote(vote._id, vote.voteId);
      }

      console.log("Vote synchronization completed");
    } catch (error) {
      console.error("Error during vote synchronization:", error);
    }
  }

  async syncVotesCastForVote(mongoVoteId, blockchainVoteId) {
    try {
      // Get the vote from MongoDB
      const vote = await Vote.findById(mongoVoteId);
      if (!vote) return;

      // For each voter, check if their vote needs to be synced to blockchain
      for (const voter of vote.voters) {
        try {
          // Get user details (assuming you have a User model with walletAddress)
          const User = mongoose.model("User");
          const user = await User.findById(voter.user);

          if (!user || !user.walletAddress) {
            console.log(
              `No wallet address for user ${voter.user}, skipping sync`
            );
            continue;
          }

          // Check if already voted on blockchain
          const hasVotedOnChain = await this.contract.hasUserVoted(
            blockchainVoteId,
            user.walletAddress
          );

          if (!hasVotedOnChain) {
            // Cast vote on blockchain
            const tx = await this.contract.castVote(
              blockchainVoteId,
              voter.votedFor
            );
            await tx.wait();
            console.log(
              `Synced vote for user ${voter.user} on vote ${blockchainVoteId}`
            );
          }
        } catch (error) {
          console.error(`Failed to sync vote for user ${voter.user}:`, error);
        }
      }
    } catch (error) {
      console.error(
        `Error syncing votes for mongo vote ${mongoVoteId}:`,
        error
      );
    }
  }

  async getVoteResults(req, res) {
    try {
      const { voteId } = req.params;

      // Find vote in MongoDB
      const vote = await Vote.findOne({
        $or: [{ voteId: voteId }, { _id: voteId }],
      });

      if (!vote) {
        return res.status(404).json({ error: "Vote not found" });
      }

      // If system powered and vote has a blockchain ID, get blockchain results
      let blockchainResults = { names: [], counts: [] };
      let resultsSource = "mongodb";

      if (this.systemPowered && !vote.voteId.startsWith("pending_")) {
        try {
          blockchainResults = await this.contract.getVoteResults(vote.voteId);
          resultsSource = "blockchain";
        } catch (error) {
          console.error("Error fetching blockchain results:", error);
          // Fall back to MongoDB results
        }
      }

      // Format results
      let results;
      if (resultsSource === "blockchain") {
        results = blockchainResults.names.map((name, index) => ({
          name,
          voteCount: Number(blockchainResults.counts[index]),
        }));
      } else {
        results = vote.candidates;
      }

      // Get vote details
      let details = {
        _id: vote._id,
        title: vote.title,
        startTime: vote.startTime,
        endTime: vote.endTime,
        status: vote.status,
        voteId: vote.voteId,
        totalVotes: vote.voters.length,
        resultsSource,
      };

      return res.status(200).json({
        success: true,
        details,
        results,
      });
    } catch (error) {
      console.error("Error getting vote results:", error);
      return res.status(500).json({ error: "Failed to get vote results" });
    }
  }

  async getVotes(req, res) {
    try {
      // Update vote statuses based on time
      await Vote.updateVoteStatus();

      // Get all votes from MongoDB
      const votes = await Vote.find()
        .populate("creator", "username email")
        .sort({ createdAt: -1 });

      // Transform for client
      const formattedVotes = votes.map((vote) => ({
        _id: vote._id,
        title: vote.title,
        startTime: vote.startTime,
        endTime: vote.endTime,
        status: vote.status,
        creator: vote.creator,
        candidateCount: vote.candidates.length,
        voterCount: vote.voters.length,
        voteId: vote.voteId,
        isPending: vote.voteId.startsWith("pending_"),
      }));

      return res.status(200).json({
        success: true,
        votes: formattedVotes,
        systemPowered: this.systemPowered,
      });
    } catch (error) {
      console.error("Error getting votes:", error);
      return res.status(500).json({ error: "Failed to get votes" });
    }
  }

  async endVote(req, res) {
    try {
      const { voteId } = req.params;

      // Find vote in MongoDB
      const vote = await Vote.findOne({
        $or: [{ voteId: voteId }, { _id: voteId }],
      });

      if (!vote) {
        return res.status(404).json({ error: "Vote not found" });
      }

      // Verify user is creator
      if (vote.creator.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json({ error: "Only the creator can end this vote" });
      }

      // Update in MongoDB
      vote.status = "closed";
      await vote.save();

      // If system powered and vote has blockchain ID, end on blockchain too
      if (this.systemPowered && !vote.voteId.startsWith("pending_")) {
        try {
          const tx = await this.contract.endVote(vote.voteId);
          const receipt = await tx.wait();

          return res.status(200).json({
            success: true,
            message: "Vote ended successfully on blockchain",
            transactionHash: receipt.transactionHash,
          });
        } catch (error) {
          console.error("Error ending vote on blockchain:", error);
          return res.status(200).json({
            success: true,
            message: "Vote ended in database, but blockchain update failed",
            needsSync: true,
          });
        }
      } else {
        return res.status(200).json({
          success: true,
          message: "Vote ended in database only",
          needsSync: this.systemPowered ? true : false,
        });
      }
    } catch (error) {
      console.error("Error ending vote:", error);
      return res
        .status(500)
        .json({ error: "Failed to end vote", details: error.message });
    }
  }

  // Manual sync endpoint
  async manualSync(req, res) {
    try {
      if (!this.systemPowered) {
        return res.status(400).json({
          error: "Cannot sync votes: System power is off",
        });
      }

      // Start sync process in background
      this.syncPendingVotes();

      return res.status(200).json({
        success: true,
        message: "Vote synchronization process started",
      });
    } catch (error) {
      return res.status(500).json({
        error: "Failed to start synchronization",
        details: error.message,
      });
    }
  }

  async getVoteDetails(req, res) {
    try {
      const { voteId } = req.params;

      // Find vote in MongoDB
      const vote = await Vote.findOne({
        $or: [{ voteId: voteId }, { _id: voteId }],
      })
        .populate("creator", "username email")
        .populate("voters.user", "username email");

      if (!vote) {
        return res.status(404).json({ error: "Vote not found" });
      }

      // Get blockchain details if available
      let blockchainDetails = null;
      if (this.systemPowered && !vote.voteId.startsWith("pending_")) {
        try {
          const details = await this.contract.getVoteDetails(vote.voteId);
          blockchainDetails = {
            title: details.title,
            description: details.description,
            startTime: new Date(Number(details.startTime) * 1000),
            endTime: new Date(Number(details.endTime) * 1000),
            isActive: details.isActive,
            maxParticipants: Number(details.maxParticipants),
            currentParticipants: Number(details.currentParticipants),
            roomName: details.roomName,
            accessCode: details.accessCode,
            status: details.status,
          };
        } catch (error) {
          console.error("Error fetching blockchain vote details:", error);
          // Continue with MongoDB details only
        }
      }

      return res.status(200).json({
        success: true,
        vote: {
          _id: vote._id,
          title: vote.title,
          startTime: vote.startTime,
          endTime: vote.endTime,
          candidates: vote.candidates,
          creator: vote.creator,
          voters: vote.voters,
          status: vote.status,
          voteId: vote.voteId,
          createdAt: vote.createdAt,
          updatedAt: vote.updatedAt,
          isPending: vote.voteId.startsWith("pending_"),
          blockchainDetails,
        },
      });
    } catch (error) {
      console.error("Error getting vote details:", error);
      return res.status(500).json({ error: "Failed to get vote details" });
    }
  }
}

export default new VoteController();

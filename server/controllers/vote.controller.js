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
    inputs: [
      { internalType: "uint256", name: "_voteId", type: "uint256" },
      { internalType: "string", name: "_newStatus", type: "string" }
    ],
    name: "updateVoteStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getVoteCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
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
      { internalType: "uint256[]", name: "startTimes", type: "uint256[]" }
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
      { internalType: "uint256[]", name: "maxParticipants", type: "uint256[]" }
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllVotesPart3",
    outputs: [
      { internalType: "uint256[]", name: "currentParticipants", type: "uint256[]" },
      { internalType: "string[]", name: "roomNames", type: "string[]" },
      { internalType: "string[]", name: "accessCodes", type: "string[]" },
      { internalType: "string[]", name: "statuses", type: "string[]" }
    ],
    stateMutability: "view",
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
    try {
      // Initialize provider - use environment variable or fallback to local hardhat node
      const providerUrl = process.env.NETWORK || "http://127.0.0.1:8545";
      this.provider = new ethers.JsonRpcProvider(providerUrl);
      
      // Get private key from environment variable
      const privateKey = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e";
      if (!privateKey) {
        console.error("No private key found in environment variables");
        this.systemPowered = false;
        return;
      }
      
      // Create wallet with private key (make sure it has the 0x prefix)
      const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      this.wallet = new ethers.Wallet(formattedKey, this.provider);
      
      // We'll deploy the contract if it doesn't exist
      this.deployContract();
      
      // Track system power status
      this.systemPowered = true;

      // Initialize and setup MQTT power monitoring
      this.setupPowerMonitoring();
      
      // Start the vote status updater
      this.startVoteStatusUpdater();
      
      console.log("VoteController initialized with blockchain connection");
    } catch (error) {
      console.error("Error initializing blockchain:", error);
      this.systemPowered = false;
    }
  }

  // New method to start the vote status updater
  startVoteStatusUpdater() {
    // Run once immediately
    this.updateBlockchainVoteStatuses().catch(err => 
      console.error("Error in initial vote status update:", err)
    );

    // Then run every minute
    setInterval(() => {
      this.updateBlockchainVoteStatuses().catch(err => 
        console.error("Error in vote status update:", err)
      );
    }, 60000); // Check every minute
    
    // Also run sync for pending votes every 2 minutes
    setInterval(() => {
      if (this.systemPowered) {
        console.log("Running scheduled sync check for pending votes...");
        this.syncPendingVotes().catch(err => 
          console.error("Error in scheduled vote sync:", err)
        );
      }
    }, 120000); // Check every 2 minutes

    console.log("Blockchain vote status updater and sync scheduler started");
  }

  // New method to update vote statuses on the blockchain
  async deployContract() {
    try {
      // Try to connect to the contract at common Hardhat deployment addresses
      const possibleAddresses = [
        "0x82B769500E34362a76DF81150e12C746093D954F", // Latest deployed contract with updateVoteStatus
        "0x7ef8E99980Da5bcEDcF7C10f41E55f759F6A174B", // Previous contract address
        "0x5FbDB2315678afecb367f032d93F642f64180aa3", // Default first contract address in Hardhat
        "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512", // Second contract
        "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"  // Third contract
      ];

      // If we have a contract address in environment, use that first
      if (process.env.CONTRACT_ADDRESS) {
        possibleAddresses.unshift(process.env.CONTRACT_ADDRESS);
      }

      // Try each address until we find a working contract
      for (const address of possibleAddresses) {
        try {
          console.log(`Trying to connect to contract at ${address}...`);

          // Create contract instance
          const contract = new ethers.Contract(
            address,
            contractABI,
            this.wallet
          );

          // Test if the contract is valid by calling a simple view function
          try {
            // This will throw an error if the contract doesn't exist or doesn't have this function
            await contract.getVoteCount();

            // If we get here, the contract is valid
            this.contract = contract;
            console.log(`Successfully connected to contract at ${address}`);
            return;
          } catch (functionError) {
            console.log(`Contract at ${address} exists but doesn't have the getVoteCount function`);
          }
        } catch (contractError) {
          console.log(`Failed to connect to contract at ${address}: ${contractError.message}`);
        }
      }

      // If we get here, we couldn't connect to any contract
      console.error("Could not connect to any contract. Please deploy the VotingSystem contract first.");
      this.systemPowered = false;
    } catch (error) {
      console.error("Error in contract deployment process:", error);
      this.systemPowered = false;
    }
  }

  async updateBlockchainVoteStatuses() {
    if (!this.systemPowered || !this.contract) {
      console.log("Cannot update vote statuses: System not powered or contract not available");
      return;
    }

    try {
      console.log("Checking for votes that need status updates...");
      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

      // Get all votes from blockchain
      const voteCount = await this.contract.getVoteCount();
      if (voteCount > 0) {
        const [part1, part2, part3] = await Promise.all([
          this.contract.getAllVotesPart1(),
          this.contract.getAllVotesPart2(),
          this.contract.getAllVotesPart3()
        ]);

        if (part1 && part1.voteIds && Array.isArray(part1.voteIds)) {
          let updatedCount = 0;

          // Check each vote
          for (let i = 0; i < part1.voteIds.length; i++) {
            const voteId = part1.voteIds[i].toString();
            const startTime = Number(part1.startTimes[i]);
            const endTime = Number(part2.endTimes[i]);
            const isActive = part2.isActives[i];
            const status = part3.statuses[i];

            // If vote is marked as "new" and current time is past start time, activate it
            if (status === "new" && currentTime >= startTime) {
              console.log(`Activating vote ${voteId}: start time ${new Date(startTime * 1000).toLocaleString()} has passed`);
              try {
                // Use the updateVoteStatus function to update the status to "active"
                const tx = await this.contract.updateVoteStatus(voteId, "active");
                await tx.wait();
                console.log(`Successfully updated vote ${voteId} status to active on blockchain`);

                // Also update MongoDB status for this vote
                const mongoVote = await Vote.findOne({ voteId: voteId });
                if (mongoVote) {
                  mongoVote.status = "active";
                  await mongoVote.save();
                  console.log(`Updated MongoDB vote ${voteId} status to active`);
                }
                updatedCount++;
              } catch (err) {
                console.error(`Error activating vote ${voteId}:`, err);
              }
            }

            // If vote is active and current time is past end time, end it
            if (isActive && status === "active" && currentTime >= endTime) {
              console.log(`Ending vote ${voteId}: end time ${new Date(endTime * 1000).toLocaleString()} has passed`);
              try {
                // Use the endVote function to end the vote
                const tx = await this.contract.endVote(voteId);
                await tx.wait();
                console.log(`Successfully ended vote ${voteId} on blockchain`);
                updatedCount++;

                // Also update MongoDB status
                const mongoVote = await Vote.findOne({ voteId: voteId });
                if (mongoVote) {
                  mongoVote.status = "closed";
                  await mongoVote.save();
                  console.log(`Updated MongoDB vote ${voteId} status to closed`);
                }
              } catch (err) {
                console.error(`Error ending vote ${voteId}:`, err);
              }
            }
          }

          if (updatedCount > 0) {
            console.log(`Updated ${updatedCount} vote statuses on the blockchain`);
          } else {
            console.log("No votes needed status updates");
          }
        }
      }
    } catch (error) {
      console.error("Error updating blockchain vote statuses:", error);
      throw error;
    }
  }

  async manualSync(req, res) {
    try {
      // First update vote statuses on the blockchain
      await this.updateBlockchainVoteStatuses();

      // Then sync any pending votes
      const result = await this.syncPendingVotes();
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error in manual sync:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  manualSync(req, res) {
    this.syncPendingVotes()
      .then(() => {
        res.status(200).json({ success: true, message: "Manual sync initiated" });
      })
      .catch((error) => {
        console.error("Error in manual sync:", error);
        res.status(500).json({ success: false, error: error.message });
      });
  }

  // Find a vote by access code
  async findVoteByAccessCode(req, res) {
    try {
      const { accessCode } = req.params;

      if (!accessCode) {
        return res.status(400).json({ success: false, error: "Access code is required" });
      }

      // First try to find the vote in MongoDB
      const vote = await Vote.findOne({ accessCode: accessCode });

      if (vote) {
        return res.status(200).json({
          success: true,
          vote: {
            _id: vote._id,
            title: vote.title,
            voteId: vote.voteId
          }
        });
      }

      // If not found in MongoDB, check if we can find it on the blockchain
      // This is more complex and would require scanning all votes on the blockchain
      // For now, we'll just return not found

      return res.status(404).json({ success: false, error: "Vote not found with the provided access code" });
    } catch (error) {
      console.error("Error finding vote by access code:", error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  setupPowerMonitoring() {
    // Initialize storage for UPS data
    this.upsData = {
      voltage: null,
      timeRemaining: null, // in minutes
      chargeLevel: null,   // in percentage
      mode: "Normal",      // Normal, Battery, etc.
      status: "offline",   // online/offline
      lastUpdate: null     // timestamp of the last update
    };

    // Subscribe to power cut alerts
    MqttController.onMessage("esp32/power_cut_alert", (message) => {
      console.log(`Power cut alert received: ${message}`);
      const isPowerCut = message === "Power Cut Detected";
      const isPowerRestored = message === "Power Restored";
      console.log(`Power cut alert received: ${isPowerCut}`);

      // Always update system power status based on the latest message
      const previousPowerState = this.systemPowered;
      this.systemPowered = !isPowerCut || isPowerRestored;

      // Update UPS mode based on power status
      if (isPowerCut) {
        this.upsData.mode = "Battery";
      } else if (isPowerRestored) {
        this.upsData.mode = "Normal";
      }
      this.upsData.lastUpdate = new Date();

      // Only take action if the power state actually changed
      if (previousPowerState !== this.systemPowered) {
        if (this.systemPowered) {
          console.log("POWER RESTORED: Resuming blockchain operations");
          
          // First update vote statuses
          console.log("Updating vote statuses...");
          this.updateBlockchainVoteStatuses()
            .then(() => {
              console.log("Vote statuses updated successfully");
              
              // Then immediately trigger sync when power is restored
              console.log("Starting automatic sync of pending votes...");
              return this.syncPendingVotes();
            })
            .then(result => {
              console.log("Automatic sync completed successfully:", result.message);
              
              // Log detailed statistics
              if (result.details) {
                console.log(`Sync stats - Votes: ${result.details.votesProcessed}, Ballots: ${result.details.ballotsProcessed}, Success: ${result.details.successfulBallots}, Failed: ${result.details.failedBallots}`);
              }
              
              // Publish power restoration notification
              MqttController.publish("power/status", JSON.stringify({
                powered: true,
                syncComplete: true,
                timestamp: new Date().toISOString(),
                stats: result.details,
                upsData: this.upsData
              }));
              
              // Update MongoDB vote statuses as well
              return Vote.updateVoteStatus();
            })
            .then(() => {
              console.log("MongoDB vote statuses updated");
            })
            .catch(err => {
              console.error("Error during power restoration process:", err);
            });
        } else {
          console.log("POWER CUT DETECTED: Switching to offline mode");
          console.log("Votes will be stored locally until power is restored");
          
          // Notify any connected clients about power outage
          MqttController.publish("power/status", JSON.stringify({
            powered: false,
            message: "System is in offline mode. Votes will be stored locally and synced when power is restored.",
            timestamp: new Date().toISOString(),
            upsData: this.upsData
          }));
        }  
      }
    });

    // Monitor system status
    MqttController.onMessage("esp32/status", (message) => {
      try {
        const status = message.toString().trim();
        this.upsData.status = status;
        this.upsData.lastUpdate = new Date();
        console.log(`System status: ${status}`);
        
        // Update system powered status based on status message
        if (status === "online" && !this.systemPowered) {
          console.log("System coming online - updating system power status");
          this.systemPowered = true;
        } else if (status === "offline" && this.systemPowered) {
          console.log("System going offline - updating system power status");
          this.systemPowered = false;
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    // Monitor UPS time remaining - using the correct topic
    MqttController.onMessage("esp32/ups_time_remaining", (message) => {
      console.log(`UPS time remaining message received: ${message}`);
      try {
        // Extract the number value from the message (e.g., "72.0 minutes" -> 72.0)
        const timeString = message.toString().trim();
        
        // Extract just the number part using regex
        const match = timeString.match(/(\d+\.?\d*)/);
        const timeInMinutes = match ? parseFloat(match[0]) : null;
        
        // Log the exact values being processed for debugging
        console.log(`UPS time remaining - Raw message: "${timeString}", Parsed value: ${timeInMinutes}`);
        
        if (timeInMinutes !== null && !isNaN(timeInMinutes)) {
          this.upsData.timeRemaining = timeInMinutes;
          this.upsData.lastUpdate = new Date();
          console.log(`UPS time remaining: ${timeInMinutes} minutes`);
        } else {
          console.error(`Failed to parse time remaining from message: "${timeString}"`);
        }
      } catch (e) {
        console.error("Error parsing UPS time remaining:", e);
      }
    });

    // Monitor UPS charge level - using the correct topic
    MqttController.onMessage("esp32/ups_charge_level", (message) => {
      try {
        // Extract the number value from the message (e.g., "92.3%" -> 92.3)
        const chargeString = message.toString().trim();

        // Remove any percentage sign if present
        const numericString = chargeString.replace(/%/g, '');
        const chargeLevel = parseFloat(numericString);
        
        // Log the exact values being processed for debugging
        console.log(`UPS charge level - Raw message: "${chargeString}", Cleaned: "${numericString}", Parsed value: ${chargeLevel}`);
        
        if (!isNaN(chargeLevel)) {
          this.upsData.chargeLevel = chargeLevel;
          this.upsData.lastUpdate = new Date();
          console.log(`UPS charge level: ${chargeLevel}%`);
          
          // Also log the complete UPS data object for debugging
          console.log("Current UPS data state:", JSON.stringify(this.upsData));
        } else {
          console.error(`Failed to parse charge level from message: "${chargeString}"`);
        }
      } catch (e) {
        console.error("Error parsing UPS charge level:", e);
      }
    });

    // Monitor UPS operating mode - using the correct topic
    MqttController.onMessage("esp32/ups_mode", (message) => {
      try {
        const mode = message.toString().trim();
        this.upsData.mode = mode;
        this.upsData.lastUpdate = new Date();
        console.log(`UPS mode: ${mode}`);

        // If mode is "Battery", update system powered status
        if (mode === "Battery" && this.systemPowered) {
          console.log("UPS switched to battery mode - updating system power status");
          this.systemPowered = false;
          
          // Notify clients about power change
          MqttController.publish("power/status", JSON.stringify({
            powered: false,
            message: "System is running on battery power. Votes will be stored locally and synced when main power is restored.",
            timestamp: new Date().toISOString(),
            upsData: this.upsData
          }));
        } else if (mode === "Normal" && !this.systemPowered) {
          console.log("UPS switched to normal mode - updating system power status");
          this.systemPowered = true;
          
          // Notify clients about power change
          MqttController.publish("power/status", JSON.stringify({
            powered: true,
            message: "System is back on main power.",
            timestamp: new Date().toISOString(),
            upsData: this.upsData
          }));
        }
      } catch (e) {
        console.error("Error parsing UPS mode:", e);
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

      console.log("System powered status:", this.systemPowered);

      let savedVote;
      let voteId;
      let transactionHash;

      if (this.systemPowered) {
        try {
          // Create vote on blockchain
          const startTimeUnix = Math.floor(
            new Date(startTime).getTime() / 1000
          );
          const endTimeUnix = Math.floor(new Date(endTime).getTime() / 1000);

          // Check if we're using the correct parameter order for createVote
          console.log("Creating vote on blockchain with parameters:", {
            title,
            description,
            optionNames,
            startTimeUnix,
            endTimeUnix,
            maxParticipants: maxParticipants || 1000,
            roomName,
            accessCode
          });
          
          // Always use the standard createVote function with the correct parameter order
          const createTx = await this.contract.createVote(
            title,
            description,
            optionNames,
            startTimeUnix,
            endTimeUnix,
            maxParticipants || 1000,
            roomName,
            accessCode
          );

          const receipt = await createTx.wait();
          console.log("Transaction receipt:", JSON.stringify(receipt, null, 2));
          transactionHash = receipt.transactionHash;

          // In ethers.js v6, events structure has changed
          // We'll use a more robust approach to extract the vote ID

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
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            candidates: optionNames.map((name) => ({ name, voteCount: 0 })),
            creator,
            voters: [],
            status: "new",
            voteId: voteId,
            syncedToBlockchain: true, // Mark this as synced since it was created on blockchain
            accessCode: accessCode,
            roomName: roomName
          });

          savedVote = await newVote.save();
          console.log("Vote saved to MongoDB with ID:", savedVote._id);
          
        } catch (error) {
          console.error("Error creating vote on blockchain:", error);
          
          // Instead of failing, let's create it in MongoDB and mark for future sync
          console.log("Creating vote in MongoDB due to blockchain error for later sync");
          
          // Generate a unique ID for this vote
          const mongoId = new mongoose.Types.ObjectId().toString();
          voteId = "pending_" + mongoId;
          
          // Create vote in MongoDB with pending status - ensure ALL sync flags are set
          const newVote = new Vote({
            title,
            description,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            candidates: optionNames.map((name) => ({ name, voteCount: 0 })),
            creator,
            voters: [],
            status: "pending", // Pending status means needs to be synced to blockchain
            voteId: voteId,
            isPending: true, // Flag this vote as needing sync
            syncedToBlockchain: false, // Explicitly mark as not synced
            needsSync: true, // Additional flag to ensure it's caught by sync process
            accessCode: accessCode,
            roomName: roomName
          });

          savedVote = await newVote.save();
          console.log("Vote saved to MongoDB with pending status, ID:", savedVote._id);
          console.log("This vote will be synced to blockchain when power is restored");
        }
      } else {
        // Power outage - create vote in MongoDB only and sync later
        // Generate a unique ID for this vote
        const mongoId = new mongoose.Types.ObjectId().toString();
        voteId = "pending_" + mongoId;
        
        console.log("Power outage detected: Creating vote in MongoDB for later blockchain sync");
        
        // Create vote in MongoDB with pending status - ensure ALL sync flags are set
        const newVote = new Vote({
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          candidates: optionNames.map((name) => ({ name, voteCount: 0 })),
          creator,
          voters: [],
          status: "pending", // Pending status means needs to be synced to blockchain
          voteId: voteId,
          isPending: true, // Flag this vote as needing sync
          syncedToBlockchain: false, // Explicitly mark as not synced
          needsSync: true, // Additional flag to ensure it's caught by sync process
          accessCode: accessCode,
          roomName: roomName
        });

        savedVote = await newVote.save();
        console.log("Vote saved to MongoDB with pending status:", savedVote._id);
      }

      // Return success response with vote details
      return res.status(201).json({
        success: true,
        message: this.systemPowered 
          ? "Vote created successfully on blockchain with room details" 
          : "Power outage detected. Vote created in database with room details for later processing.",
        voteId: voteId,
        vote: savedVote,
        transactionHash: transactionHash || null,
      });
    } catch (error) {
      console.error("Error creating vote:", error);
      return res
        .status(500)
        .json({ 
          success: false,
          error: "Failed to create vote", 
          details: error.message 
        });
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
      console.log(`Checking if user ${voter} has already voted in vote ${voteId}`);
      console.log(`Current vote has ${voteInDb.voters.length} voters`);
      
      // Get the current user's ID as a string for comparison
      const currentUserId = voter.toString();
      console.log(`Current user ID for comparison: ${currentUserId}`);
      
      // PART 1: Check MongoDB for existing votes from this user
      let alreadyVotedInDb = false;
      if (voteInDb.voters && voteInDb.voters.length > 0) {
        for (const v of voteInDb.voters) {
          // Make sure we have a valid user ID before comparing
          if (v.user) {
            const voterIdStr = v.user.toString();
            console.log(`Comparing voter ${voterIdStr} with current user ${currentUserId}`);
            if (voterIdStr === currentUserId) {
              alreadyVotedInDb = true;
              console.log('User has already voted in MongoDB!');
              break;
            }
          }
        }
      } else {
        console.log('No existing voters found for this vote in MongoDB');
      }
      
      // PART 2: If vote is on blockchain, check if user has already voted there
      let alreadyVotedOnBlockchain = false;
      if (this.systemPowered && !voteInDb.voteId.startsWith("pending_") && !voteInDb.voteId.startsWith("blockchain_") && !isNaN(Number(voteInDb.voteId))) {
        try {
          // Check if there's a record of this user's blockchain vote in MongoDB
          const userBlockchainVote = voteInDb.voters.find(v => {
            return v.user.toString() === currentUserId && v.blockchainTx;
          });
          
          if (userBlockchainVote) {
            console.log('Found a blockchain vote record for this user in MongoDB');
            alreadyVotedOnBlockchain = true;
          }
        } catch (error) {
          console.error("Error checking blockchain vote status:", error);
        }
      }
      
      // If user has already voted either in MongoDB or on blockchain, prevent duplicate voting
      if (alreadyVotedInDb || alreadyVotedOnBlockchain) {
        return res.status(400).json({ error: "You have already cast a vote" });
      }


      // If blockchain is powered and vote is not pending or blockchain vote, proceed with blockchain voting
      if (this.systemPowered && !voteInDb.voteId.startsWith("pending_") && !voteInDb.voteId.startsWith("blockchain_")) {
        try {
          // Generate a unique address for each user-vote combination to prevent "Already voted" errors
          console.log("Generating unique wallet for this vote");
          
          // Create a unique private key derived from user ID and vote ID (just for this vote)
          // This ensures each user has a different address for each vote
          const uniqueString = `vote-${voteId}-user-${voter}-${Date.now()}`;
          const uniqueBytes = ethers.keccak256(ethers.toUtf8Bytes(uniqueString));
          const uniquePrivateKey = uniqueBytes.slice(0, 66); // Take first 32 bytes (64 chars + 0x)
          
          // Create a unique wallet for this vote
          const uniqueWallet = new ethers.Wallet(uniquePrivateKey, this.provider);
          console.log(`Created unique voting wallet with address: ${uniqueWallet.address}`);
          
          // Fund the unique wallet with enough ETH for the transaction
          // Send a small amount of ETH from the main wallet to the unique wallet
          const fundTx = await this.wallet.sendTransaction({
            to: uniqueWallet.address,
            value: ethers.parseEther("0.01") // 0.01 ETH should be enough for gas
          });
          await fundTx.wait();
          console.log(`Funded unique wallet with 0.01 ETH`);
          
          // For blockchain votes, we need to extract the numeric ID
          // The blockchain contract expects numeric IDs, not MongoDB ObjectIds
          if (!isNaN(Number(voteInDb.voteId))) {
            console.log("Using numeric voteId:", voteInDb.voteId);
            
            // Get the contract address - in ethers.js v6, we need to use getAddress()
            const contractAddress = await this.contract.getAddress();
            console.log("Contract address:", contractAddress);
            
            // Create a new contract instance connected to the unique wallet
            const uniqueContract = new ethers.Contract(
              contractAddress,
              this.contract.interface,
              uniqueWallet
            );
            
            // Cast vote on blockchain using the unique wallet
            const tx = await uniqueContract.castVote(voteInDb.voteId, optionId);
            const receipt = await tx.wait();
            console.log("Vote cast successfully on blockchain using unique wallet");
            
            // Update MongoDB record for consistency
            voteInDb.voters.push({
              user: voter,
              votedFor: optionId,
              votedAt: new Date(),
              voterAddress: uniqueWallet.address, // Store the unique address used
              blockchainTx: receipt.transactionHash // Store the transaction hash for verification
            });

            // Increment vote count for the chosen option
            voteInDb.candidates[optionId].voteCount += 1;
            await voteInDb.save();

            return res.status(200).json({
              success: true,
              message: "Vote cast successfully on blockchain",
              transactionHash: receipt.transactionHash,
            });
          } else {
            // If we can't use the ID directly, store in MongoDB only
            console.log("Vote ID is not numeric, storing in MongoDB only");
            throw new Error("Cannot cast vote on blockchain: Vote ID is not numeric");
          }

          // This code is now moved inside the if block above
        } catch (error) {
          console.error("Error casting vote on blockchain:", error);

          // If blockchain transaction fails, store in MongoDB for later sync
          console.log("Blockchain transaction failed: Storing vote for later sync");
          
          // Mark the vote itself as pending if it isn't already
          if (!voteInDb.voteId.startsWith("pending_") && !voteInDb.voteId.startsWith("blockchain_")) {
            // Store the original voteId for later sync
            voteInDb.originalVoteId = voteInDb.voteId;
            // Mark the vote itself as pending
            voteInDb.voteId = `pending_${voteInDb.voteId}`;
            console.log(`Marked vote ID as pending due to blockchain failure: ${voteInDb.voteId}`);
          }
          
          // Store vote with detailed sync information
          voteInDb.voters.push({
            user: voter,
            votedFor: optionId,
            votedAt: new Date(),
            pendingSync: true,
            syncAttempts: 0,
            syncStatus: "pending",
            syncError: error.message
          });
          voteInDb.candidates[optionId].voteCount += 1;
          await voteInDb.save();

          return res.status(200).json({
            success: true,
            message: "Your vote has been recorded and will be synchronized with the blockchain shortly. This happens automatically in the background.",
            needsSync: true,
            error: error.message
          });
        }
      } else {
        // Power outage or pending vote - store in MongoDB only with pending sync status
        console.log("System offline: Storing vote in MongoDB for later sync");
        
        // If the vote doesn't already have a pending flag in its ID, add it
        if (!voteInDb.voteId.startsWith("pending_") && !voteInDb.voteId.startsWith("blockchain_")) {
          // Store the original voteId for later sync
          voteInDb.originalVoteId = voteInDb.voteId;
          // Mark the vote itself as pending
          voteInDb.voteId = `pending_${voteInDb.voteId}`;
          console.log(`Marked vote ID as pending: ${voteInDb.voteId}`);
        }
        
        // Mark this vote as needing blockchain sync when power is restored
        voteInDb.voters.push({
          user: voter,
          votedFor: optionId,
          votedAt: new Date(),
          pendingSync: true, // Flag indicating this vote needs to be synced to blockchain
          syncAttempts: 0, // Track sync attempts
          syncStatus: "pending" // Status of blockchain sync
        });
        voteInDb.candidates[optionId].voteCount += 1;
        await voteInDb.save();

        return res.status(200).json({
          success: true,
          message: "Power outage detected. Vote stored securely and will be synchronized with the blockchain automatically when power is restored.",
          voteId: voteInDb._id,
          pendingSync: true
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
    if (!this.systemPowered || !this.contract) {
      console.log("Cannot sync votes: System not powered or contract not available");
      return { success: false, error: "System not powered or contract not available" };
    }

    try {
      console.log("Power restored: Starting vote synchronization process...");
      const results = [];
      
      // 1. First, sync any pending vote creations (votes created during outage)
      // Enhanced query to make sure we catch ALL cases of pending votes
      const pendingVotes = await Vote.find({
        $or: [
          { voteId: { $regex: /^pending_/ } },
          { isPending: true },
          { syncedToBlockchain: false },
          { status: "pending" }
        ]
      });
      
      // Also get all votes that don't have syncedToBlockchain explicitly set to true
      // This catches admin-created votes that might have been missed
      const additionalPendingVotes = await Vote.find({
        syncedToBlockchain: { $ne: true },
        voteId: { $not: { $regex: /^synced_/ } }
      });
      
      // Log more details about what was found to help debug
      // console.log(`Found ${pendingVotes.length} pending votes with the following details:`);
      // pendingVotes.forEach((vote, index) => {
      //   console.log(`[${index + 1}] Vote ID: ${vote._id}, Title: ${vote.title}, isPending: ${vote.isPending}, voteId: ${vote.voteId}, syncedToBlockchain: ${vote.syncedToBlockchain}, status: ${vote.status}`);
      // });
      
      // Log additional pending votes found
      // console.log(`Found ${additionalPendingVotes.length} additional votes that might need syncing:`);
      additionalPendingVotes.forEach((vote, index) => {
        // Only add to pendingVotes if not already included
        const alreadyIncluded = pendingVotes.some(pv => pv._id.toString() === vote._id.toString());
        if (!alreadyIncluded) {
          console.log(`[+${index + 1}] Adding vote: ${vote._id}, Title: ${vote.title}, isPending: ${vote.isPending}, voteId: ${vote.voteId}`);
          pendingVotes.push(vote);
        }
      });

      // console.log(`Total ${pendingVotes.length} vote creations to sync - processing now...`);

      // 2. Find any individual votes cast during outage (marked with pendingSync)
      const votesWithPendingBallots = await Vote.find({
        "voters.pendingSync": true
      });
      
      // console.log(`Found ${votesWithPendingBallots.length} votes with pending ballots to sync`);
      
      if (pendingVotes.length === 0 && votesWithPendingBallots.length === 0) {
        console.log("No pending votes or ballots to sync");
        return { success: true, message: "No pending votes or ballots to sync" };
      }
      
      // Track overall sync statistics
      let totalBallotsToSync = 0;
      let successfullySyncedBallots = 0;
      let failedSyncBallots = 0;

      // Process each pending vote creation
      for (const vote of pendingVotes) {
        try {
          // console.log(`Syncing vote creation: ${vote.title}`);
          
          // Extract a numeric vote ID for the blockchain
          let blockchainVoteId;
          
          // If we have a stored original ID and it's numeric, use that
          if (vote.originalVoteId && !isNaN(Number(vote.originalVoteId))) {
            blockchainVoteId = vote.originalVoteId;
            console.log(`Using stored original vote ID: ${blockchainVoteId}`);
          } else {
            // Try to extract a numeric ID from the current vote ID
            const numericMatch = vote.voteId.match(/\d+/);
            if (numericMatch) {
              blockchainVoteId = numericMatch[0];
              // console.log(`Extracted numeric vote ID: ${blockchainVoteId} from ${vote.voteId}`);
            } else {
              // If we can't find a numeric part, generate a new numeric ID
              blockchainVoteId = Date.now().toString();
              // console.log(`Generated new numeric vote ID: ${blockchainVoteId}`);
            }
          }
          
          // Final check to ensure it's numeric
          if (isNaN(Number(blockchainVoteId))) {
            throw new Error(`Invalid blockchain vote ID: ${blockchainVoteId}. Must be numeric.`);
          }
          
          // console.log(`Using blockchain vote ID: ${blockchainVoteId}`);
          
          // Check if this vote has any votes that need to be synced
          const pendingVotersForThisVote = vote.voters.filter(v => v.pendingSync === true);
          if (pendingVotersForThisVote.length > 0) {
            console.log(`This vote has ${pendingVotersForThisVote.length} pending voters that will be synced after creation`);
          }

          // Create vote on blockchain
          const startTimeUnix = Math.floor(new Date(vote.startTime).getTime() / 1000);
          const endTimeUnix = Math.floor(
            new Date(vote.endTime).getTime() / 1000
          );
          const optionNames = vote.candidates.map((c) => c.name);

          // Check the contract interface to ensure we're passing parameters correctly
          console.log("Checking contract interface...");
          const createVoteFunction = this.contract.interface.getFunction("createVote");
          // console.log("Contract expects parameters:", createVoteFunction ? createVoteFunction.inputs.map(i => i.name) : "Unknown");
          
          // Ensure we have all required parameters with proper defaults
          const title = vote.title || "Untitled Vote";
          const description = vote.description || "No description provided";
          const roomName = vote.roomName || "Default Room";
          const accessCode = vote.accessCode || "0000";
          const maxParticipants = vote.maxParticipants || 1000;
          
          // Log the parameters we're sending to the contract
          // console.log("Syncing vote with parameters:", {
          //   title,
          //   description,
          //   optionNames,
          //   startTimeUnix,
          //   endTimeUnix,
          //   maxParticipants,
          //   roomName,
          //   accessCode
          // });
          
          // Create the vote on the blockchain with proper parameter order
          console.log("Creating vote on blockchain...");
          const tx = await this.contract.createVote(
            title,
            description,
            optionNames,
            startTimeUnix,
            endTimeUnix,
            maxParticipants,
            roomName,
            accessCode
          );
          
          console.log("Vote creation transaction sent, waiting for confirmation...");

          const receipt = await tx.wait();
          let voteId;

          // Try to extract the voteId from the transaction receipt
          if (receipt.logs && receipt.logs.length > 0) {
            try {
              // The first log is likely our VoteCreated event
              const log = receipt.logs[0];
              // For ethers v6
              if (log.args) {
                voteId = log.args[0].toString();
              } 
              // For ethers v5 or custom parsing
              else if (log.topics && log.topics.length > 1) {
                // The second topic should be the indexed voteId
                voteId = parseInt(log.topics[1], 16).toString();
              }
            } catch (parseErr) {
              console.error("Error parsing log for voteId:", parseErr);
            }
          }

          if (!voteId) {
            // If we couldn't extract the ID, use a fallback approach
            try {
              const voteCount = await this.contract.getVoteCount();
              voteId = voteCount.toString();
              console.log(`Using fallback voteId: ${voteId}`);
            } catch (countErr) {
              console.error("Error getting vote count:", countErr);
              throw new Error("Could not determine voteId");
            }
          }

          console.log(`Vote synced to blockchain with ID: ${voteId}`);

          // Update the MongoDB record with the blockchain voteId
          // Store both the synced status and the numeric blockchain ID
          await Vote.findByIdAndUpdate(vote._id, {
            voteId: `synced_${voteId}`, // Mark as synced instead of pending
            isPending: false,
            syncedToBlockchain: true,
            syncedAt: new Date(),
            originalVoteId: voteId // Store the numeric ID for future reference
          });
          
          console.log(`Updated vote ID from ${vote.voteId} to synced_${voteId} and stored original ID ${voteId}`);

          // Process any pending votes for this vote that were cast during offline mode
          // These will be handled in the second phase of the sync process

          results.push({
            success: true,
            originalId: vote._id,
            newVoteId: voteId,
            title: vote.title,
          });
        } catch (voteError) {
          console.error(`Error syncing vote ${vote.title}:`, voteError);
          results.push({
            success: false,
            originalId: vote._id,
            error: voteError.message,
            title: vote.title,
          });
        }
      }

      // After processing pending vote creations, now process individual ballots that need syncing
      console.log("Now syncing individual ballots cast during outage...");
      
      for (const vote of votesWithPendingBallots) {
        // Skip votes that haven't been synced to blockchain yet
        // These will be handled in the first phase of syncing
        if (vote.isPending === true && vote.voteId.startsWith("pending_")) {
          console.log(`Skipping ballot sync for vote ${vote._id}: Vote itself needs to be synced first`);
          results.push({
            voteId: vote._id,
            title: vote.title,
            status: "deferred",
            reason: "Vote needs to be created on blockchain first"
          });
          continue;
        }
        
        // Check if vote ID is valid for blockchain
        if ((vote.voteId.startsWith("pending_") || vote.voteId.startsWith("blockchain_") || isNaN(Number(vote.voteId))) && !vote.originalVoteId) {
          console.log(`Skipping ballot sync for vote ${vote._id}: Invalid voteId format for blockchain`);
          results.push({
            voteId: vote._id,
            title: vote.title,
            status: "skipped",
            reason: "Invalid voteId format for blockchain"
          });
          continue;
        }
        
        // Find which voters need to be synced
        const pendingVoters = vote.voters.filter(v => v.pendingSync === true);
        totalBallotsToSync += pendingVoters.length;
        
        console.log(`Processing ${pendingVoters.length} pending ballots for vote: ${vote.title} (ID: ${vote.voteId})`);
        
        // Process each pending voter
        for (let i = 0; i < pendingVoters.length; i++) {
          const voter = pendingVoters[i];
          try {
            // Create a unique wallet for this ballot sync
            const uniqueString = `sync-${vote.voteId}-user-${voter.user}-${Date.now()}-attempt-${voter.syncAttempts + 1}`;
            const uniqueBytes = ethers.keccak256(ethers.toUtf8Bytes(uniqueString));
            const uniquePrivateKey = uniqueBytes.slice(0, 66);
            const uniqueWallet = new ethers.Wallet(uniquePrivateKey, this.provider);
            
            console.log(`Created unique wallet for ballot sync: ${uniqueWallet.address}`);
            
            // Fund the wallet for the transaction
            const fundTx = await this.wallet.sendTransaction({
              to: uniqueWallet.address,
              value: ethers.parseEther("0.01")
            });
            await fundTx.wait();
            
            // Get the contract address
            const contractAddress = await this.contract.getAddress();
            
            // Create contract instance with unique wallet
            const uniqueContract = new ethers.Contract(
              contractAddress,
              this.contract.interface,
              uniqueWallet
            );
            
            // First, extract the actual blockchain vote ID (without any prefix)
            let blockchainVoteId;
            
            // Extract only the numeric part of the vote ID, regardless of any prefixes
            if (vote.originalVoteId && !isNaN(Number(vote.originalVoteId))) {
              // If we have a stored original ID and it's numeric, use that
              blockchainVoteId = vote.originalVoteId;
              console.log(`Using stored original vote ID: ${blockchainVoteId}`);
            } else {
              // Otherwise try to extract a numeric ID from the current vote ID
              const numericMatch = vote.voteId.match(/\d+/);
              if (numericMatch) {
                blockchainVoteId = numericMatch[0];
                console.log(`Extracted numeric vote ID: ${blockchainVoteId} from ${vote.voteId}`);
              } else {
                // If we can't find a numeric part, check if the ID itself is numeric
                if (!isNaN(Number(vote.voteId))) {
                  blockchainVoteId = vote.voteId;
                  console.log(`Using vote ID directly: ${blockchainVoteId}`);
                } else {
                  throw new Error(`Cannot extract numeric vote ID from: ${vote.voteId}`);
                }
              }
            }
            
            // Final check to make sure the vote ID is numeric for the blockchain
            if (isNaN(Number(blockchainVoteId))) {
              throw new Error(`Invalid blockchain vote ID: ${blockchainVoteId}. Must be numeric.`);
            }
            
            console.log(`Syncing ballot for vote ${blockchainVoteId}, option ${voter.votedFor}`);
            
            // Check the contract interface to ensure we're passing parameters correctly
            const castVoteFunction = uniqueContract.interface.getFunction("castVote");
            console.log("Contract expects castVote parameters:", castVoteFunction ? castVoteFunction.inputs.map(i => i.name) : "Unknown");
            
            // Cast the vote on blockchain - this will increment the candidate vote count
            console.log(`Casting vote with parameters: voteId=${blockchainVoteId}, optionId=${voter.votedFor}`);
            const tx = await uniqueContract.castVote(Number(blockchainVoteId), voter.votedFor);
            const receipt = await tx.wait();
            
            // Verify the transaction was successful
            console.log(`Vote transaction successful with hash: ${receipt.transactionHash}`);
            
            // Verify the vote count was incremented on the blockchain
            try {
              const voteDetails = await this.contract.getVoteDetails(blockchainVoteId);
              const candidateVotes = voteDetails.options[voter.votedFor].voteCount.toString();
              console.log(`Verified candidate ${voter.votedFor} now has ${candidateVotes} votes on the blockchain`);
            } catch (verifyError) {
              console.warn(`Could not verify vote count update: ${verifyError.message}`);
            }
            
            // Find the voter in the array to update (we can't directly update the filtered voter object)
            const voterIndex = vote.voters.findIndex(v => 
              v.user.toString() === voter.user.toString() && 
              v.pendingSync === true &&
              v.votedFor === voter.votedFor
            );
            
            if (voterIndex !== -1) {
              // Update the voter record to mark as synced
              vote.voters[voterIndex].pendingSync = false;
              vote.voters[voterIndex].syncStatus = "completed";
              vote.voters[voterIndex].syncedAt = new Date();
              vote.voters[voterIndex].syncAttempts += 1;
              vote.voters[voterIndex].blockchainTx = receipt.transactionHash;
              vote.voters[voterIndex].voterAddress = uniqueWallet.address;
              
              // If this is the first successful sync for this vote, update the vote ID
              if (vote.voteId.startsWith('pending_') && !vote.syncedToBlockchain) {
                // Extract a numeric ID
                let originalId;
                if (vote.originalVoteId && !isNaN(Number(vote.originalVoteId))) {
                  originalId = vote.originalVoteId;
                } else {
                  const numericMatch = vote.voteId.match(/\d+/);
                  originalId = numericMatch ? numericMatch[0] : Date.now().toString();
                }
                
                // Update the vote with the synced status
                vote.voteId = `synced_${originalId}`;
                vote.originalVoteId = originalId; // Store the numeric ID
                vote.syncedToBlockchain = true;
                console.log(`Updated vote ID to synced_${originalId} after successful ballot sync`);
              }
              
              successfullySyncedBallots++;
              console.log(`Successfully synced ballot with tx hash: ${receipt.transactionHash}`);
            }
          } catch (error) {
            // Find the voter in the array to update
            const voterIndex = vote.voters.findIndex(v => 
              v.user.toString() === voter.user.toString() && 
              v.pendingSync === true &&
              v.votedFor === voter.votedFor
            );
            
            if (voterIndex !== -1) {
              // Update the voter record to mark sync attempt failed
              vote.voters[voterIndex].syncAttempts += 1;
              vote.voters[voterIndex].syncError = error.message;
              
              // Only keep trying up to 3 times, then mark as failed
              if (vote.voters[voterIndex].syncAttempts >= 3) {
                vote.voters[voterIndex].syncStatus = "failed";
                console.log(`Failed to sync ballot after ${vote.voters[voterIndex].syncAttempts} attempts: ${error.message}`);
              }
            }
            
            failedSyncBallots++;
            console.error(`Error syncing ballot: ${error.message}`);
          }
        }
        
        // Save the updated vote with sync status
        await vote.save();
        
        results.push({
          voteId: vote._id,
          title: vote.title,
          ballotsProcessed: pendingVoters.length,
          status: "processed"
        });
      }
      
      // Return results with comprehensive statistics
      return {
        success: true,
        message: `Sync complete. Processed ${results.length} votes and ${totalBallotsToSync} ballots. Success: ${successfullySyncedBallots}, Failed: ${failedSyncBallots}`,
        details: {
          votesProcessed: results.length,
          ballotsProcessed: totalBallotsToSync,
          successfulBallots: successfullySyncedBallots,
          failedBallots: failedSyncBallots,
          results: results
        },
        syncedCount: results.filter((r) => r.success).length,
        failedCount: results.filter((r) => !r.success).length,
      };
    } catch (error) {
      console.error("Error in syncPendingVotes:", error);
      return { success: false, error: error.message };
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

      let votes = [];
      let blockchainError = null;
      let mongoVotes = [];
      
      // Try to get blockchain votes first if system is powered and contract is initialized
      if (this.systemPowered && this.contract) {
        try {
          // Get vote count to check if contract is accessible and has any votes
          const voteCount = await this.contract.getVoteCount();
          console.log(`Blockchain connected. Vote count: ${voteCount}`);
          
          // Only try to get votes if there are any
          if (voteCount > 0) {
            // Get all votes in a single transaction if possible
            const [part1, part2, part3, allVoteOptions] = await Promise.all([
              this.contract.getAllVotesPart1().catch(err => {
                console.error("Error in getAllVotesPart1:", err);
                return { voteIds: [], titles: [], descriptions: [], startTimes: [] };
              }),
              this.contract.getAllVotesPart2().catch(err => {
                console.error("Error in getAllVotesPart2:", err);
                return { endTimes: [], isActives: [], creators: [], maxParticipants: [] };
              }),
              this.contract.getAllVotesPart3().catch(err => {
                console.error("Error in getAllVotesPart3:", err);
                return { currentParticipants: [], roomNames: [], accessCodes: [], statuses: [] };
              }),
              this.contract.getAllVoteOptions().catch(err => {
                console.error("Error in getAllVoteOptions:", err);
                return [];
              })
            ]);
            
            // Check if we have valid data from the blockchain
            if (part1 && part1.voteIds && Array.isArray(part1.voteIds) && part1.voteIds.length > 0) {
              console.log(`Found ${part1.voteIds.length} votes in blockchain`);
              votes = part1.voteIds.map((id, index) => {
                // Convert options to candidates format
                const voteId = id.toString();
                const voteIndex = parseInt(voteId) - 1;
                let candidates = [];
                
                // Check if we have options data for this vote
                if (allVoteOptions && Array.isArray(allVoteOptions) && allVoteOptions[voteIndex]) {
                  candidates = allVoteOptions[voteIndex].map((option, optionIndex) => ({
                    name: option.name,
                    voteCount: parseInt(option.voteCount.toString()),
                    _id: `${voteId}_${optionIndex}`
                  }));
                }
                
                return {
                  voteId: voteId,
                  title: part1.titles[index],
                  description: part1.descriptions[index],
                  startTime: new Date(Number(part1.startTimes[index]) * 1000),
                  endTime: new Date(Number(part2.endTimes[index]) * 1000),
                  isActive: part2.isActives[index],
                  creator: part2.creators[index],
                  maxParticipants: Number(part2.maxParticipants[index]),
                  currentParticipants: Number(part3.currentParticipants[index]),
                  roomName: part3.roomNames[index],
                  accessCode: part3.accessCodes[index],
                  status: part3.statuses[index],
                  candidates: candidates
                };
              });
            } else {
              console.log("No votes found in blockchain or empty response");
            }
          } else {
            console.log("No votes in blockchain yet (vote count is 0)");
          }
        } catch (blockchainErr) {
          console.error("Error fetching from blockchain:", blockchainErr);
          blockchainError = blockchainErr.message || "Could not fetch votes from blockchain";
          // We'll continue with MongoDB votes even if blockchain fails
        }
      } else {
        console.log("Blockchain system not powered or contract not initialized");
        blockchainError = "Blockchain system not available";
        
        // Only fetch from MongoDB if blockchain is not available
        console.log("Fetching votes from MongoDB due to blockchain unavailability");
        mongoVotes = await Vote.find()
          .populate("creator", "username email")
          .sort({ createdAt: -1 });
      }

      // Merge and deduplicate votes
      // If blockchain is available, only include synced and pending votes from MongoDB
      // If blockchain is unavailable, use all MongoDB votes
      let mergedVotes = [];
      
      if (this.systemPowered && votes.length > 0) {
        // When blockchain is available, use blockchain votes and only pending/synced votes from MongoDB
        mergedVotes = [
          ...votes,  // Blockchain votes first
          ...mongoVotes.filter(v => {
            return v.voteId && v.voteId.startsWith && (
              v.voteId.startsWith("pending_") || 
              v.voteId.startsWith("synced_")
            );
          })
        ];
        console.log(`Using ${votes.length} blockchain votes and ${mergedVotes.length - votes.length} pending/synced MongoDB votes`);
      } else {
        // When blockchain is unavailable, use all MongoDB votes
        mergedVotes = mongoVotes;
        console.log(`Using ${mongoVotes.length} MongoDB votes due to blockchain unavailability`);
      }

      // Transform for client with better error handling
      const formattedVotes = mergedVotes.map(vote => {
        try {
          return {
            _id: vote._id || vote.voteId,
            title: vote.title || "Untitled Vote",
            startTime: vote.startTime,
            endTime: vote.endTime,
            status: vote.status || "unknown",
            creator: vote.creator,
            candidates: vote.candidates || [],  // Include the candidates array
            candidateCount: vote.candidates ? vote.candidates.length : 0,
            voterCount: vote.currentParticipants || (vote.voters ? vote.voters.length : 0),
            voteId: vote.voteId,
            roomName: vote.roomName || null,  // Include room name from blockchain/MongoDB
            accessCode: vote.accessCode || null,  // Include access code from blockchain/MongoDB
            description: vote.description || "",  // Include description
            isPending: vote.voteId && vote.voteId.startsWith ? vote.voteId.startsWith("pending_") : false,
            isSynced: vote.voteId && vote.voteId.startsWith ? vote.voteId.startsWith("synced_") : false,
            source: vote.voteId && vote.voteId.startsWith ? 
              (vote.voteId.startsWith("pending_") || vote.voteId.startsWith("synced_")) ? "mongodb" : "blockchain" 
              : "blockchain"
          };
        } catch (err) {
          console.error("Error formatting vote:", err, vote);
          return null;
        }
      }).filter(v => v !== null); // Remove any votes that failed to format

      return res.status(200).json({
        success: true,
        votes: formattedVotes,
        systemPowered: this.systemPowered,
        blockchainError: blockchainError,
        blockchainVotesCount: votes.length,
        mongoVotesCount: mongoVotes.length,
        totalVotesCount: formattedVotes.length
      });
    } catch (error) {
      console.error("Error getting votes:", error);
      return res.status(500).json({ error: "Failed to get votes" });
    }
  }

  async endVote(req, res) {
    try {
      const { voteId } = req.params;

      // Check if voteId is a valid MongoDB ObjectId (24 char hex string)
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(voteId);
      
      // Find vote in MongoDB using appropriate query based on ID type
      let vote;
      if (isValidObjectId) {
        // If it's a valid ObjectId, search by _id
        vote = await Vote.findById(voteId);
      }
      
      // If not found by _id or not a valid ObjectId, try searching by blockchain voteId
      if (!vote) {
        vote = await Vote.findOne({ voteId: voteId });
      }

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

  async getUserVoteHistory(req, res) {
    try {
      const userId = req.user._id; // Get user ID from authenticated request
      
      // Find all votes where this user has voted
      const votes = await Vote.find({
        "voters.user": userId
      })
      .populate("creator", "username email")
      .populate("voters.user", "username email");
      
      if (!votes || votes.length === 0) {
        return res.status(200).json({ 
          success: true, 
          history: [] 
        });
      }
      
      // Format the response
      const voteHistory = votes.map(vote => {
        // Find this user's specific vote
        const userVote = vote.voters.find(v => v.user._id.toString() === userId.toString());
        const candidateVoted = vote.candidates[userVote.votedFor];
        
        return {
          _id: vote._id,
          voteId: vote.voteId,
          title: vote.title,
          description: vote.description,
          status: vote.status,
          startTime: vote.startTime,
          endTime: vote.endTime,
          candidateVoted: candidateVoted ? candidateVoted.name : "Unknown",
          candidateParty: candidateVoted && candidateVoted.party ? candidateVoted.party : "",
          votedAt: userVote.votedAt,
          blockchainReference: userVote.blockchainReference || "",
          verified: !!userVote.blockchainReference
        };
      });
      
      return res.status(200).json({
        success: true,
        history: voteHistory
      });
    } catch (error) {
      console.error("Error fetching user vote history:", error);
      return res.status(500).json({ 
        success: false, 
        error: "Failed to fetch voting history", 
        details: error.message 
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

  async getPowerStatus(req, res) {
    try {
      // Get the latest power data from MQTT controller
      const mqttData = MqttController.getLatestData();
      
      // Format the response
      const powerStatus = {
        powered: this.systemPowered,
        voltage: mqttData.voltage ? parseFloat(mqttData.voltage) : (this.upsData?.voltage || null),
        powerCut: mqttData.powerCut === 'true',
        timestamp: new Date().toISOString(),
        message: this.systemPowered 
          ? 'System is online and connected to blockchain' 
          : 'System is in offline mode. Votes will be stored locally and synced when power is restored.',
        // Add new UPS data fields
        ups: {
          timeRemaining: this.upsData?.timeRemaining || null,
          chargeLevel: this.upsData?.chargeLevel || null,
          mode: this.upsData?.mode || 'Unknown',
          status: this.upsData?.status || 'Unknown',
          lastUpdate: this.upsData?.lastUpdate ? this.upsData.lastUpdate.toISOString() : null
        }
      };
      
      return res.status(200).json(powerStatus);
    } catch (error) {
      console.error("Error getting power status:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new VoteController();

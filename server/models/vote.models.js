import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    candidates: [
      {
        name: {
          type: String,
          required: true,
        },
        voteCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    voters: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        votedFor: {
          type: Number,
          required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
        // Fields for blockchain sync tracking
        pendingSync: {
          type: Boolean,
          default: false
        },
        syncStatus: {
          type: String,
          enum: ["pending", "completed", "failed"],
          default: "pending"
        },
        syncAttempts: {
          type: Number,
          default: 0
        },
        syncError: String,
        syncedAt: Date,
        blockchainTx: String,
        voterAddress: String
      },
    ],
    status: {
      type: String,
      enum: ["pending", "new", "active", "completed", "closed"],
      default: "new",
    },
    voteId: {
      type: String,
      required: true,
    },
    originalVoteId: {
      type: String,
      default: null
    },
    isPending: {
      type: Boolean,
      default: false
    },
    syncedToBlockchain: {
      type: Boolean,
      default: false
    },
    syncedAt: {
      type: Date,
      default: null
    },
    accessCode: {
      type: String,
      trim: true,
    },
    roomName: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// The updateVoteStatus should be a static method, not an instance method
// since it needs to update multiple documents
voteSchema.statics.updateVoteStatus = async function () {
  const currentTime = new Date();

  // Update vote status whose start time has passed the current time
  await this.updateMany(
    {
      status: "new",
      startTime: { $lte: currentTime },
    },
    { status: "active" }
  );

  // Update vote status whose end time has passed the current time
  await this.updateMany(
    {
      status: "active",
      endTime: { $lte: currentTime },
    },
    { status: "completed" }
  );
};

export default mongoose.model("Vote", voteSchema);

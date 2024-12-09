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
          type: Number, // Index of the candidate
          //   required: true,
        },
        votedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "new", "active", "completed", "closed"],
      default: "new",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vote", voteSchema);

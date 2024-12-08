import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Room name is required"],
      trim: true,
      minlength: [3, "Room name must be at least 3 characters long"],
      maxlength: [50, "Room name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      required: [true, "Room description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Room creator is required"],
    },
    vote: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vote",
      required: [true, "Associated vote is required"],
    },
    status: {
      type: String,
      enum: ["waiting", "active", "completed", "cancelled"],
      default: "waiting",
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
        hasVoted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    maxParticipants: {
      type: Number,
      required: [true, "Maximum participants limit is required"],
      min: [2, "Room must allow at least 2 participants"],
      max: [1000, "Room cannot exceed 1000 participants"],
    },
    startTime: {
      type: Date,
      required: [true, "Room start time is required"],
    },
    endTime: {
      type: Date,
      required: [true, "Room end time is required"],
      validate: {
        validator: function (value) {
          return value > this.startTime;
        },
        message: "End time must be after start time",
      },
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    accessCode: {
      type: String,
      required: function () {
        return this.isPrivate;
      },
    },
    settings: {
      allowChat: {
        type: Boolean,
        default: true,
      },
      allowLateJoin: {
        type: Boolean,
        default: true,
      },
      showResults: {
        type: Boolean,
        default: true,
      },
      requireVerification: {
        type: Boolean,
        default: false,
      },
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
roomSchema.index({ creator: 1, status: 1 });
roomSchema.index({ startTime: 1 });
roomSchema.index({ "participants.user": 1 });

// Virtual for current participant count
roomSchema.virtual("participantCount").get(function () {
  return this.participants.length;
});

// Virtual for remaining time
roomSchema.virtual("timeRemaining").get(function () {
  if (this.status === "completed" || this.status === "cancelled") return 0;
  const now = new Date();
  return Math.max(0, this.endTime.getTime() - now.getTime());
});

// Methods
roomSchema.methods.isActive = function () {
  const now = new Date();
  return (
    this.status === "active" && now >= this.startTime && now <= this.endTime
  );
};

roomSchema.methods.canJoin = function (userId) {
  if (this.status !== "waiting" && this.status !== "active") return false;
  if (this.participants.length >= this.maxParticipants) return false;
  if (!this.settings.allowLateJoin && this.status === "active") return false;
  return !this.participants.some(
    (p) => p.user.toString() === userId.toString()
  );
};

roomSchema.methods.addParticipant = function (userId) {
  if (!this.canJoin(userId)) throw new Error("Cannot join room");
  this.participants.push({ user: userId });
  return this.save();
};

roomSchema.methods.removeParticipant = function (userId) {
  this.participants = this.participants.filter(
    (p) => p.user.toString() !== userId.toString()
  );
  return this.save();
};

const Room = mongoose.model("Room", roomSchema);

export default Room;

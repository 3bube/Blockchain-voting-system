import mongoose from "mongoose";

const powerStatusSchema = new mongoose.Schema({
  device_id: { type: String, default: "main-system", index: true },
  status: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed }, // For storing additional audit information
}, {
  // Prevent overwriting existing documents - each status change creates a new document
  timestamps: true, // Add createdAt and updatedAt fields
});

// Create compound index for efficient querying by device_id and timestamp
powerStatusSchema.index({ device_id: 1, timestamp: -1 });

const PowerStatus = mongoose.model("PowerStatus", powerStatusSchema);

export default PowerStatus;

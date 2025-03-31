import mongoose from "mongoose";

const powerStatusSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, required: true, default: Date.now },
});

const PowerStatus = mongoose.model("PowerStatus", powerStatusSchema);

export default PowerStatus;

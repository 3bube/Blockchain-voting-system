import express from "express";
import MqttController from "../controllers/mqtt.controller.js";
import { protect } from "../Middleware/auth.js";
const router = express.Router();

// Get current power status
router.get("/status", (req, res) => {
  const latestData = MqttController.getLatestData();
  res.json({
    voltage: latestData.voltage,
    powerCut: latestData.powerCut === "true",
    timestamp: new Date(),
  });
});

// Admin-only routes
router.use("/admin", protect, (req, res, next) => {
  // Check if user is admin
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
});

// Publish to MQTT topic (admin only)
router.post("/admin/publish", express.json(), (req, res) => {
  const { topic, message } = req.body;

  if (!topic || !message) {
    return res.status(400).json({ error: "Topic and message are required" });
  }

  const published = MqttController.publish(topic, message);

  if (published) {
    res.json({ success: true, message: "Message published successfully" });
  } else {
    res.status(500).json({ error: "Failed to publish message" });
  }
});

export default router;

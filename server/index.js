import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import socketService from "./services/socket.service.js";
import morgan from "morgan";
import cron from "node-cron";
import Vote from "./models/vote.models.js";
import MqttController from "./controllers/mqtt.controller.js";
import WebSocketController from "./controllers/websocket.controller.js";
// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1); // Exit with failure
  }
};

// Initialize express app
const app = express();
const PORT = process.env.PORT ?? 5000;

// CORS configuration
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://blockchain-voting-system-lime.vercel.app",
  ], // React app's default development port
  credentials: true, // Allow credentials (cookies, authorization headers)
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

cron.schedule("* * * * *", async () => {
  try {
    await Vote.updateVoteStatus();
  } catch (error) {
    console.error("Failed to update vote status:", error);
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "Blockchain Voting System API",
    status: "active",
    timestamp: new Date().toISOString(),
  });
});

// Routes
import authRoute from "./routes/auth.routes.js";
import voteRoute from "./routes/vote.routes.js";
import roomRoute from "./routes/room.routes.js";
import userRoute from "./routes/user.routes.js";
import powerRoute from "./routes/power.routes.js";
import mqttRoutes from "./routes/mqtt.routes.js";

// Initialize MQTT controller
MqttController.connect();

// Note: Power cut alerts and voltage monitoring are handled in VoteController
// This ensures all blockchain operations respond properly to power changes

app.use("/api/vote", voteRoute);
app.use("/api", authRoute);
app.use("/api/room", roomRoute);
app.use("/api/user", userRoute);
app.use("/api", powerRoute);
app.use("/api", mqttRoutes);

// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    
    // Initialize socket service
    socketService.initialize(server);
    
    server.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
      
      // Initialize WebSocket server for power status updates AFTER server is listening
      WebSocketController.initialize(server);
      console.log(`WebSocket server for power status updates is active on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import http from "http";
import socketService from "./services/socket.service.js";
import cron from "node-cron";
import Vote from "./models/vote.models.js";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
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
    "http://localhost:5173",
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

app.use("/api/vote", voteRoute);
app.use("/api", authRoute);
app.use("/api", roomRoute);
app.use("/api/user", userRoute);
app.use("/api", powerRoute);
// Start server
const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);
    socketService.initialize(server);
    server.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || "development"
        } mode on port ${PORT}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

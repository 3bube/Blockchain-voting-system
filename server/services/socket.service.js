import { Server } from "socket.io";

class SocketService {
  constructor() {
    this.io = null;
    this.activeRooms = new Map(); // Track active voting rooms
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CLIENT_URL ?? "http://localhost:5173",
        methods: ["GET", "POST"],
      },
    });

    this.io.on("connection", (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Join a voting room
      socket.on("join_room", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);

        // Update room participants count
        const room = this.io.sockets.adapter.rooms.get(roomId);
        const participantCount = room ? room.size : 0;
        this.io
          .to(roomId)
          .emit("participant_update", { count: participantCount });
      });

      // Handle vote casting
      socket.on("cast_vote", ({ roomId, candidateId, voterId }) => {
        // Emit vote update to all room participants
        this.io.to(roomId).emit("vote_update", {
          candidateId,
          voterId,
          timestamp: new Date(),
        });
      });

      // Handle notifications
      socket.on("send_notification", ({ type, message, targetRoom }) => {
        if (targetRoom) {
          this.io.to(targetRoom).emit("notification", { type, message });
        } else {
          socket.broadcast.emit("notification", { type, message });
        }
      });

      socket.on("disconnecting", () => {
        // Update participant count for all rooms the socket was in
        socket.rooms.forEach((roomId) => {
          if (roomId !== socket.id) {
            const room = this.io.sockets.adapter.rooms.get(roomId);
            const participantCount = room ? room.size - 1 : 0; // Subtract 1 as user is leaving
            this.io
              .to(roomId)
              .emit("participant_update", { count: participantCount });
          }
        });
      });

      socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }

  // Helper methods for emitting events
  emitToRoom(roomId, event, data) {
    this.io.to(roomId).emit(event, data);
  }

  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  getRoomParticipants(roomId) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
  }
}

export default new SocketService();

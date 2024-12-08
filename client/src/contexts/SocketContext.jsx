import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useToast } from "@chakra-ui/react";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const socketInstance = io(
      import.meta.env.VITE_API_URL ?? "http://localhost:5000",
      {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to WebSocket server");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from WebSocket server");
    });

    socketInstance.on("notification", ({ type, message }) => {
      toast({
        title: type.charAt(0).toUpperCase() + type.slice(1),
        description: message,
        status: type === "error" ? "error" : "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [toast]);

  const joinVotingRoom = (roomId) => {
    if (socket && isConnected) {
      socket.emit("join_room", roomId);
    }
  };

  const castVote = (roomId, candidateId, voterId) => {
    if (socket && isConnected) {
      socket.emit("cast_vote", { roomId, candidateId, voterId });
      console.log(`Voted for candidate ${candidateId} in room ${roomId}`);
    }
  };

  const sendNotification = (type, message, targetRoom = null) => {
    if (socket && isConnected) {
      socket.emit("send_notification", { type, message, targetRoom });
    }
  };

  const value = {
    socket,
    isConnected,
    joinVotingRoom,
    castVote,
    sendNotification,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

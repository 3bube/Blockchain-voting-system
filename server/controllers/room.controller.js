import Room from "../models/room.models.js";
import Vote from "../models/vote.models.js";

// get room by id
export const getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get access code by vote id
export const getAccessCodeByVoteId = async (req, res) => {
  try {
    const room = await Room.findOne({ vote: req.params.id });
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// join room by access code
export const joinRoomByAccessCode = async (req, res) => {
  const { accessCode } = req.body;
  try {
    const room = await Room.findOne({ accessCode });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    if (room.status === "cancelled") {
      return res.status(400).json({ error: "Room is not available" });
    }

    if (room.participants.length >= room.maxParticipants) {
      return res.status(400).json({ error: "Room is full" });
    }

    // if(room.status !== "waiting" && room.status !== "active") {
    //   return res.status(400).json({ error: "Room is not active" });
    // }

    if (room.participants.includes(req.user._id)) {
      return res.status(400).json({ error: "You are already in the room" });
    }

    room.participants.push(req.user._id);

    await room.save();

    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// create a new room
export const createRoom = async (req, res) => {
  try {
    const { voteId, name, description, isPrivate, maxParticipants, startTime, endTime, settings } = req.body;
    
    // Validate required fields
    if (!voteId || !name || !startTime || !endTime) {
      return res.status(400).json({ 
        success: false,
        error: "Missing required fields: voteId, name, startTime, and endTime are required" 
      });
    }
    
    // Check if vote exists
    const vote = await Vote.findById(voteId);
    if (!vote) {
      return res.status(404).json({ 
        success: false,
        error: "Vote not found" 
      });
    }
    
    // Generate access code if room is private
    const accessCode = isPrivate 
      ? Math.random().toString(36).substring(2, 8).toUpperCase() 
      : Math.random().toString(36).substring(2, 8).toUpperCase(); // Always generate a code for now
    
    // Create new room
    const newRoom = new Room({
      name,
      description: description || `Voting room for ${name}`,
      creator: req.user._id,
      vote: voteId,
      maxParticipants: maxParticipants || 100,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      isPrivate: isPrivate || false,
      accessCode,
      settings: settings || {
        allowChat: true,
        allowLateJoin: true,
        showResults: true,
        requireVerification: false
      },
      status: "waiting"
    });
    
    const savedRoom = await newRoom.save();
    
    return res.status(201).json({
      success: true,
      message: "Room created successfully",
      room: savedRoom
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to create room", 
      details: error.message 
    });
  }
};

// get all rooms
export const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate("creator", "name email")
      .populate("vote", "title description")
      .sort({ createdAt: -1 });
      
    return res.status(200).json({
      success: true,
      rooms
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return res.status(500).json({ 
      success: false,
      error: "Failed to fetch rooms" 
    });
  }
};

// update room status
export const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ["waiting", "active", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Invalid status. Must be one of: waiting, active, completed, cancelled"
      });
    }
    
    // Find the room
    const room = await Room.findById(id);
    if (!room) {
      return res.status(404).json({
        success: false,
        error: "Room not found"
      });
    }
    
    // Check if user is the creator or an admin
    if (room.creator.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to update this room"
      });
    }
    
    // Update the room status
    room.status = status;
    await room.save();
    
    return res.status(200).json({
      success: true,
      message: `Room status updated to ${status}`,
      room
    });
  } catch (error) {
    console.error("Error updating room status:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to update room status",
      details: error.message
    });
  }
};

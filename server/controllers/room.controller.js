import Room from "../models/room.models.js";

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

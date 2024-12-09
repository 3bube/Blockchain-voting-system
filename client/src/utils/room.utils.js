// In client/src/utils/room.utils.js
import newRequest from "./newRequest";

// send a request to the server to get the access code for a room
export const getRoomByVoteId = async (voteId) => {
  try {
    const response = await newRequest.get(`/${voteId}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error || "Failed to fetch access code"
    );
  }
};

// send a request to the server to join a room
export const joinRoomByAccessCode = async (accessCode) => {
  try {
    const response = await newRequest.post("/join", { accessCode });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error ?? "Failed to join room");
  }
};

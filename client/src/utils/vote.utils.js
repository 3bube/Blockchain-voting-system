import newRequest from "./newRequest";

export const createVote = async (voteData) => {
  try {
    const candidateNames = voteData.candidates.map(
      (candidate) => candidate.name
    );

    if (candidateNames.length < 2) {
      throw new Error("At least two candidates are required");
    }

    const response = await newRequest.post("/vote/create", {
      ...voteData,
      candidates: candidateNames,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message ?? error.message);
  }
};

export const getAllVotes = async () => {
  try {
    const response = await newRequest.get("vote/all");
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching votes");
  }
};

export const getVoteByRoomId = async (id) => {
  try {
    const response = await newRequest.get(`/vote/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching vote");
  }
};

export const castVote = async (voteId, candidateIndex) => {
  try {
    const response = await newRequest.post(`vote/${voteId}/cast`, {
      candidateIndex,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error casting vote");
  }
};

export const getVotingHistory = async () => {
  try {
    const response = await newRequest.get("/vote/history");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching voting history"
    );
  }
};

export const generateRoomCode = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let roomCode = "";
  for (let i = 0; i < 6; i++) {
    roomCode += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return roomCode;
};

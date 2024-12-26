import newRequest from "./newRequest";

export const createVote = async (voteData) => {
  if (!voteData) throw new Error("No data provided");

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
  if (!id) throw new Error("ID is required");
  try {
    const response = await newRequest.get(`/vote/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error fetching vote");
  }
};

export const castVote = async (voteId, candidateIndex) => {
  if (!voteId || !candidateIndex)
    throw new Error("Provide the vote id and candidate index");
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
    throw new Error(error.response || "Error fetching voting history");
  }
};

export const updateVote = async (id) => {
  if (!id) throw new Error("Vote id is required");

  try {
    const response = await newRequest.patch(`/vote/end/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error updating vote details", error);
  }
};

export const deleteVote = async (id) => {
  if (!id) throw new Error("Vote id is required");

  try {
    const response = await newRequest.delete(`/vote/delete/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting vote", error);
  }
};

export const endVote = async (id) => {
  if (!id) throw new Error("Vote id is required");
  console.log(id);
  try {
    const response = await newRequest.post(`/vote/end/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error updating vote details", error);
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

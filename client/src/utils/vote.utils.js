import newRequest from "./newRequest";

export const createVote = async (title, startTime, endTime, candidates) => {
  try {
    const candidateNames = candidates.map((candidate) => candidate.name);
    const response = await newRequest.post("/vote/create", {
      title,
      startTime,
      endTime,
      candidates: candidateNames,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error creating vote");
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

export const getVoteById = async (id) => {
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

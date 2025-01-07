import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Test = () => {
  const [candidate, setCandidate] = useState("");
  const [votes, setVotes] = useState([]);
  const [contract, setContract] = useState(null);

  const contractAddress = "0x73511669fd4de447fed18bb79bafeac93ab7f31f"; // Replace with local address after deployment
  const contractABI = [
    {
      inputs: [
        { internalType: "string", name: "_title", type: "string" },
        { internalType: "string", name: "_description", type: "string" },
        { internalType: "string[]", name: "_optionNames", type: "string[]" },
        { internalType: "uint256", name: "_startTime", type: "uint256" },
        { internalType: "uint256", name: "_endTime", type: "uint256" },
      ],
      name: "createVote",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "_voteId", type: "uint256" }],
      name: "getVoteResults",
      outputs: [
        { internalType: "string[]", name: "names", type: "string[]" },
        { internalType: "uint256[]", name: "counts", type: "uint256[]" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];

  const initializeContract = async () => {
    try {
      // Use Hardhat's local JSON-RPC provider
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

      // Use the first pre-funded account from Hardhat
      const signer = await provider.getSigner(0);

      // Create a contract instance with the signer
      const contractInstance = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      setContract(contractInstance);
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  useEffect(() => {
    initializeContract();
  }, []);

  const handleVote = async () => {
    try {
      const tx = await contract.createVote(candidate);
      await tx.wait();
      alert("Vote cast successfully!");
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const fetchVotes = async () => {
    try {
      const result = await contract.getVoteResults(2); // Pass the voteId you want to fetch
      console.log(result);
      setVotes(result.names); // result will have names and counts
    } catch (error) {
      console.error("Error fetching votes:", error);
    }
  };

  const createNewVote = async () => {
    try {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const startTime = now + 60; // Starts in 1 minute
      const endTime = now + 3600; // Ends in 1 hour

      const tx = await contract.createVote(
        "Vote Title",
        "Vote Description",
        [`${candidate}`, `${candidate}`], // Must have at least 2 options
        startTime,
        endTime
      );

      await tx.wait(); // Wait for transaction to be mined
      console.log("Vote created successfully");
    } catch (error) {
      console.error("Error creating vote:", error);
    }
  };

  return (
    <div>
      <h1>Blockchain Voting App</h1>
      <input
        type="text"
        value={candidate}
        onChange={(e) => setCandidate(e.target.value)}
        placeholder="Enter candidate"
      />
      <button onClick={handleVote}>Vote</button>
      <button onClick={fetchVotes}>Get Votes</button>
      <button onClick={createNewVote}>Create New Vote</button>
      <ul>
        {votes.map((v, index) => (
          <li key={index}>{v}</li>
        ))}
      </ul>
    </div>
  );
};

export default Test;

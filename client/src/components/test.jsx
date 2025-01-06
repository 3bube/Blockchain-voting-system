import { useEffect, useState } from "react";
import { ethers } from "ethers";

const Test = () => {
  const [candidate, setCandidate] = useState("");
  const [votes, setVotes] = useState([]);
  const [contract, setContract] = useState(null);

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contractABI = [
    {
      inputs: [{ internalType: "string", name: "_candidate", type: "string" }],
      name: "createVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getVotes",
      outputs: [{ internalType: "string[]", name: "", type: "string[]" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  const initializeContract = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    setContract(new ethers.Contract(contractAddress, contractABI, signer));
  };

  useEffect(() => {
    initializeContract();
  }, []);

  const handleVote = async () => {
    try {
      // Connect wallet
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const tx = await contract.createVote(candidate);
      await tx.wait();
      alert("Vote cast successfully!");
    } catch (error) {
      console.error("Error casting vote:", error);
    }
  };

  const fetchVotes = async () => {
    try {
      const result = await contract.getVotes();
      setVotes(result);
    } catch (error) {
      console.error("Error fetching votes:", error);
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
      <ul>
        {votes.map((v, index) => (
          <li key={index}>{v}</li>
        ))}
      </ul>
    </div>
  );
};

export default Test;

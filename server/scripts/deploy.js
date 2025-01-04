import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  // Replace 'Vote' with your contract's name
  const Vote = await ethers.getContractFactory("VotingSystem");
  const voting = await Vote.deploy(); // Deploy the contract

  await voting.waitForDeployment(); // Wait for the contract to be deployed
  console.log("Vote contract deployed to:", await voting.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

// Script to deploy the VotingSystem contract to a local Hardhat node
const fs = require('fs');
const path = require('path');
const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying VotingSystem contract...');

  // Get the contract factory
  const VotingSystem = await ethers.getContractFactory('VotingSystem');
  
  // Deploy the contract
  const votingSystem = await VotingSystem.deploy();
  
  // Wait for deployment to complete
  await votingSystem.deployed();
  
  console.log(`VotingSystem contract deployed to: ${votingSystem.address}`);
  
  // Save the contract address to a file for easy access
  const deploymentInfo = {
    contractAddress: votingSystem.address,
    deploymentTime: new Date().toISOString(),
    network: network.name
  };
  
  // Create a deployment info file
  fs.writeFileSync(
    path.join(__dirname, '../deployment-info.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('Deployment info saved to deployment-info.json');
  
  // Log instructions for updating .env
  console.log('\nTo use this contract in your application:');
  console.log(`1. Add CONTRACT_ADDRESS=${votingSystem.address} to your .env file`);
  console.log('2. Restart your server');
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });

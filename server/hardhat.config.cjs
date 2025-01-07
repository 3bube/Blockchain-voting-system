require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Local Hardhat network
      accounts: [process.env.ETH_PRIVATE_KEY],
    },
    // goerli: {
    //   url: process.env.NETWORK,
    //   accounts: [process.env.ETH_PRIVATE_KEY],
    // },
  },
};

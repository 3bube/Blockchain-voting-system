require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    goerli: {
      url: process.env.NETWORK,
      accounts: [process.env.ETH_PRIVATE_KEY],
    },
  },
};
  
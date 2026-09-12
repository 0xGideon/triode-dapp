require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// Build the accounts array from the PRIVATE_KEY env var if it is set.
const accounts = process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    robinhoodTestnet: {
      chainId: 46630,
      url:
        process.env.ROBINHOOD_TESTNET_RPC_URL ||
        "https://rpc.testnet.chain.robinhood.com/rpc",
      accounts,
    },
    robinhoodMainnet: {
      chainId: 4663,
      url:
        process.env.ROBINHOOD_MAINNET_RPC_URL ||
        "https://rpc.mainnet.chain.robinhood.com",
      accounts,
    },
  },
};

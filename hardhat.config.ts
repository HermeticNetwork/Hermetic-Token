import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  paths: {
    artifacts: './src/artifacts',
  },
  solidity: "0.8.19",
};

export default config;

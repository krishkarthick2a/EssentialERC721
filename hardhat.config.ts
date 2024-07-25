import { HardhatUserConfig } from 'hardhat/config';
// import '@nomicfoundation/hardhat-foundry';
import '@nomicfoundation/hardhat-toolbox';

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      hardfork: 'cancun',
    },
  },
  solidity: {
    version: '0.8.24',
    settings: {
      evmVersion: 'cancun',
      optimizer: {
        enabled: true,
        // runs: 1_000_000_000,
        runs: 100,
      },
      viaIR: true,
    },
  },
  paths: {
    tests: './test/ethers',
  },
  typechain: {
    outDir: 'typechain',
  },
};

export default config;

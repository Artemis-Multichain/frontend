interface NetworkConfig {
  AIPromptMarketplace: string;
  artemisChallengesV2Address: string;
  usdcAddress: string;
  name: string;
  chainId: number;
  explorerUrl: string;
  rpcUrl: string;
}

interface ChainConfigs {
  [key: number]: NetworkConfig;
}

const chainConfigs: ChainConfigs = {
  // Base Sepolia
  84532: {
    AIPromptMarketplace: '0x338A8D070eD0AD108A02b4A85D789e16a8640933',
    artemisChallengesV2Address: '0xcF9577b373070Ae442Cc9F3B3e69CC6F53eb8787',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    name: 'Base Sepolia',
    chainId: 84532,
    explorerUrl: 'https://sepolia.basescan.org',
    rpcUrl: 'https://sepolia.base.org',
  },
  // Arbitrum Sepolia
  421614: {
    AIPromptMarketplace: '0x47887dC0305769285d8d793C3dd669f61274e959',
    artemisChallengesV2Address: '0xC0275C30c2b22718a9C8f36747f13D4Da8147561',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    explorerUrl: 'https://sepolia.arbiscan.io',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
  },
  // Base Mainnet
  8453: {
    AIPromptMarketplace: '',
    artemisChallengesV2Address: '',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    name: 'Base',
    chainId: 8453,
    explorerUrl: 'https://basescan.org',
    rpcUrl: 'https://mainnet.base.org',
  },
  // Arbitrum One
  42161: {
    AIPromptMarketplace: '', // Add mainnet addresses when deployed
    artemisChallengesV2Address: '',
    usdcAddress: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
    name: 'Arbitrum One',
    chainId: 42161,
    explorerUrl: 'https://arbiscan.io',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
  },
};

// Helper functions
const getChainConfig = (chainId: number): NetworkConfig => {
  const config = chainConfigs[chainId];
  if (!config) {
    throw new Error(`Chain ID ${chainId} not supported`);
  }
  return config;
};

const getSupportedChains = (): number[] => {
  return Object.keys(chainConfigs).map(Number);
};

const isChainSupported = (chainId: number): boolean => {
  return chainId in chainConfigs;
};

// // Helper to get transaction URL
// const getExplorerTxUrl = (chainId: number, txHash: string): string => {
//   const config = getChainConfig(chainId);
//   return `${config.explorerUrl}/tx/${txHash}`;
// };

// // Helper to get address URL
// const getExplorerAddressUrl = (chainId: number, address: string): string => {
//   const config = getChainConfig(chainId);
//   return `${config.explorerUrl}/address/${address}`;
// };

export {
  chainConfigs,
  getChainConfig,
  getSupportedChains,
  isChainSupported,
  // switchToNetwork,
  // getExplorerTxUrl,
  // getExplorerAddressUrl,
  type NetworkConfig,
};

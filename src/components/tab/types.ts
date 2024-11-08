// types.ts
export interface Challenge {
  id: number;
  ipfsUrl: string;
  duration: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
  winner: string;
  prizeAmount: string;
  prizeType: 'ETH' | 'USDC';
  numSubmissions: number;
  timeRemaining: number;
  chain: string;
  chainId: number;
  chainName: string; // Display name for the chain
}

export interface ChainStats {
  totalChallenges: number;
  totalPrizePool: {
    eth: string;
    usdc: string;
  };
  totalSubmissions: number;
  averageSubmissions: number;
}

export interface APIResponse {
  status: 'success' | 'partial_success' | 'error';
  data: {
    challenges: Challenge[];
    stats: {
      overall: ChainStats;
      by_chain: {
        [key: string]: ChainStats;
      };
    };
  };
  meta: {
    chains: {
      name: string;
      displayName: string;
      contractAddress: string;
      status: 'success' | 'error';
      error?: string;
    }[];
    timestamp: string;
  };
}

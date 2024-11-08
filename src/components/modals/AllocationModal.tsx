import { useAllocationModal } from '@/hooks/useAllocationModal';
import { useSmartAccount } from '@particle-network/connectkit';
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers, JsonRpcProvider, Contract, formatUnits } from 'ethers';
import { sepolia } from 'viem/chains';

const USDC_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const CHAIN_CONFIG = {
  Sepolia: {
    rpc: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    chainId: 11155111,
  },
  'OP Sepolia': {
    rpc: `https://opt-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    usdcAddress: '0x5fd84259d66Cd46123540766Be93DFE6D43130D7',
    chainId: 11155420,
  },
  'Arbitrum Sepolia': {
    rpc: `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
    chainId: 421614,
  },
  'Base Sepolia': {
    rpc: `https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
    chainId: 84532,
  },
  'BNB Chain': {
    rpc: 'https://bsc-dataseed.binance.org',
    usdcAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
    chainId: 56,
  },
} as const;

type ChainConfigKey = keyof typeof CHAIN_CONFIG;
interface ChainInfo {
  rpc: string;
  usdcAddress: string;
  chainId: number;
}

if (!ALCHEMY_API_KEY) {
  throw new Error(
    'NEXT_PUBLIC_ALCHEMY_API_KEY is not set in environment variables'
  );
}

export interface Allocation {
  name: string;
  icon: string;
  iconBg: string;
  percentage: string;
  amount: string;
  balance: number;
}

const AllocationModal = () => {
  const { isOpen, closeModal } = useAllocationModal();
  const smartAccount = useSmartAccount();
  const address = smartAccount?.getAddress();
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const fetchBalances = useCallback(async () => {
    if (!address) {
      console.log('No address available');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching balances for:', address);

      const balancePromises = Object.entries(CHAIN_CONFIG).map(
        async ([chain, config]) => {
          try {
            const provider = new JsonRpcProvider(config.rpc);
            const usdcContract = new Contract(
              config.usdcAddress,
              USDC_ABI,
              provider
            );

            const [balance, decimals] = await Promise.all([
              usdcContract.balanceOf(address),
              usdcContract.decimals(),
            ]);

            const balanceNum = Number(formatUnits(balance, decimals));
            console.log(`${chain} balance:`, balanceNum);

            return {
              chain,
              balance: balanceNum,
            };
          } catch (error) {
            console.error(`Error fetching balance for ${chain}:`, error);
            return {
              chain,
              balance: 0,
            };
          }
        }
      );

      const balances = await Promise.all(balancePromises);
      const total = balances.reduce((sum, { balance }) => sum + balance, 0);
      setTotalBalance(total);

      console.log('Total balance:', total);

      const updatedAllocations = balances.map(({ chain, balance }) => ({
        name: chain,
        icon: getChainIcon(chain),
        iconBg: getChainIconBg(chain),
        percentage:
          total > 0 ? `${((balance / total) * 100).toFixed(2)}%` : '0.00%',
        amount: `$${balance.toFixed(2)}`,
        balance,
      }));

      setAllocations(updatedAllocations);
      setHasLoaded(true);
    } catch (error) {
      console.error('Error fetching balances:', error);
      setError('Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isOpen && address && !hasLoaded) {
        await fetchBalances();
      }
    };

    loadData();

    // Cleanup function
    return () => {
      isMounted = false;
      // Only reset when modal is actually closed
      if (!isOpen) {
        setHasLoaded(false);
        setError(null);
      }
    };
  }, [isOpen, address, fetchBalances, hasLoaded]);

  const getChainIcon = (chain: string) => {
    const iconMap: Record<string, string> = {
      Sepolia: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=035',
      'OP Sepolia':
        'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg?v=035',
      'Arbitrum Sepolia':
        'https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=035',
      'Base Sepolia':
        'https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp',
      'BNB Chain': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=035',
    };
    return iconMap[chain] || '';
  };

  const getChainIconBg = (chain: string) => {
    const bgMap: Record<string, string> = {
      Sepolia: 'bg-blue-500',
      'OP Sepolia': 'bg-red-500',
      'Arbitrum Sepolia': 'bg-blue-600',
      Base: 'bg-blue-400',
      'BNB Chain': 'bg-yellow-400',
    };
    return bgMap[chain] || '';
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg rounded-lg bg-black/90 p-6 shadow-xl"
          >
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">USDC Allocation</h2>
              <div className="mt-2 flex items-baseline">
                <span className="ml-2 text-sm text-gray-400">
                  Total Balance: &nbsp;
                </span>
                <span className="text-xl font-bold text-purple-400">
                  ${totalBalance.toFixed(2)}
                </span>
              </div>
              {isLoading && (
                <p className="text-gray-400 mt-2">Loading balances...</p>
              )}
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {allocations.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`${item.iconBg} h-8 w-8 rounded-full flex items-center justify-center text-white text-sm font-medium cursor-pointer`}
                    >
                      <img src={item.icon} alt="" className="w-5 h-5" />
                    </motion.div>
                    <span className="text-xs font-medium text-white">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-2 bg-gray-800 rounded overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: item.percentage }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-purple-400 rounded"
                      />
                    </div>
                    <span className="text-gray-400 w-16">
                      {item.percentage}
                    </span>
                    <span className="text-gray-400 w-24 text-right">
                      {item.amount}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AllocationModal;

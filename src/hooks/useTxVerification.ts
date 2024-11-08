import { useState, useCallback, useRef, useEffect } from 'react';
import { ethers } from 'ethers';
import { getChainConfig } from '@/abi';
import AIPromptMarketplace from '@/abi/AIPromptMarketplace.json';
import { useAccount } from '@particle-network/connectkit';

const MINIMAL_SEDA_PROVER_ABI = [
  {
    inputs: [{ internalType: 'bytes32', name: 'id', type: 'bytes32' }],
    name: 'getDataResult',
    outputs: [
      {
        components: [
          { internalType: 'string', name: 'version', type: 'string' },
          { internalType: 'bytes32', name: 'dr_id', type: 'bytes32' },
          { internalType: 'bool', name: 'consensus', type: 'bool' },
          { internalType: 'uint8', name: 'exit_code', type: 'uint8' },
          { internalType: 'bytes', name: 'result', type: 'bytes' },
          { internalType: 'uint64', name: 'block_height', type: 'uint64' },
          { internalType: 'uint128', name: 'gas_used', type: 'uint128' },
          { internalType: 'bytes', name: 'payback_address', type: 'bytes' },
          { internalType: 'bytes', name: 'seda_payload', type: 'bytes' },
        ],
        internalType: 'struct SedaDataTypes.DataResult',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];

interface TxVerificationState {
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  requestId: string | null;
  verificationResult: string | null;
  transactionHash: string | null;
  isVerificationSuccessful: boolean;
}

export const useTxVerification = (
  pollingInterval = 5000,
  maxPollingTime = 180000
) => {
  const contractRefs = useRef<{
    provider: ethers.Provider | null;
    marketplace: ethers.Contract | null;
  }>({
    provider: null,
    marketplace: null,
  });

  const [state, setState] = useState<TxVerificationState>({
    isLoading: false,
    isSending: false,
    error: null,
    requestId: null,
    verificationResult: null,
    transactionHash: null,
    isVerificationSuccessful: false,
  });

  const [shouldPoll, setShouldPoll] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);
  const { isConnected, address, chain } = useAccount();

  useEffect(() => {
    const initContract = async () => {
      try {
        const chainConfig = getChainConfig(84532);
        const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);

        const marketplace = new ethers.Contract(
          chainConfig.AIPromptMarketplace,
          AIPromptMarketplace,
          provider
        );

        contractRefs.current = {
          provider,
          marketplace,
        };
      } catch (error) {
        console.error('Error initializing contract:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to initialize contract',
        }));
      }
    };

    initContract();
  }, []);

  const pollTxResult = useCallback(async () => {
    const { marketplace, provider } = contractRefs.current;

    if (
      !state.requestId ||
      !shouldPoll ||
      !pollingStartTime ||
      !marketplace ||
      !provider
    ) {
      return;
    }

    try {
      const elapsedTime = Date.now() - pollingStartTime;

      if (elapsedTime > maxPollingTime) {
        setShouldPoll(false);
        setState((prev) => ({
          ...prev,
          error: 'Polling timeout: Transaction verification took too long',
          isLoading: false,
        }));
        return;
      }

      // Get SEDA result
      const sedaProverAddress = await marketplace.sedaProverContract();
      const prover = new ethers.Contract(
        sedaProverAddress,
        MINIMAL_SEDA_PROVER_ABI,
        provider
      );

      let result;
      try {
        result = await prover.getDataResult(state.requestId);
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes('execution reverted') ||
            error.message.includes('CALL_EXCEPTION'))
        ) {
          console.log('⏳ SEDA data not yet available, will retry...');
          return;
        }
        throw error;
      }

      if (!result.consensus) {
        console.log('⏳ Oracle consensus not yet reached');
        return;
      }

      // If consensus reached, get verification result
      try {
        const txResult = await marketplace.getLatestTxResult();
        console.log('📄 Transaction verification result:', txResult);

        const isSuccessful = txResult.toLowerCase().includes('successful');

        setState((prev) => ({
          ...prev,
          verificationResult: txResult,
          isLoading: false,
          isSending: false,
          isVerificationSuccessful: isSuccessful, // Set success flag based on result
        }));

        setShouldPoll(false);
        console.log('✅ Verification completed successfully');
      } catch (error: any) {
        if (error.message?.includes('NoTxResultAvailable')) {
          console.log('⚠️ No result available yet');
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('❌ Polling error:', error);

      const isTemporaryError =
        error instanceof Error &&
        (error.message.includes('execution reverted') ||
          error.message.includes('CALL_EXCEPTION') ||
          error.message.includes('DataResultNotFound'));

      if (!isTemporaryError) {
        setShouldPoll(false);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
          isLoading: false,
          isSending: false,
        }));
      } else {
        console.log('⏳ Temporary error, will retry...');
      }
    }
  }, [state.requestId, shouldPoll, pollingStartTime, maxPollingTime]);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (shouldPoll) {
      console.log('🔄 Setting up polling interval:', {
        intervalMs: pollingInterval,
        maxTimeMs: maxPollingTime,
        requestId: state.requestId,
      });

      pollInterval = setInterval(() => {
        console.log('⏰ Polling interval triggered');
        pollTxResult();
      }, pollingInterval);

      pollTxResult();
    }

    return () => {
      if (pollInterval) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(pollInterval);
      }
    };
  }, [shouldPoll, pollTxResult, pollingInterval]);

  const verifyTransaction = useCallback(
    async (
      txHash: string,
      chainId: string = chain?.id?.toString() || 'defaultChainId'
    ) => {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        isSending: true,
        error: null,
      }));

      try {
        console.log('Verifying with chain ID:', chainId);
        const response = await fetch('/api/tx-verification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ txHash, chainId }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const data = await response.json();
        console.log('Verification submitted successfully:', {
          requestId: data.requestId,
          chain: data.chain,
        });

        setState((prev) => ({
          ...prev,
          requestId: data.requestId,
          transactionHash: data.transactionHash,
          isSending: false,
        }));

        setShouldPoll(true);
        setPollingStartTime(Date.now());
      } catch (error) {
        console.error('Error in verification request:', error);
        setState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : 'Unknown error occurred',
          isLoading: false,
          isSending: false,
        }));
        throw error;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isSending: false,
      error: null,
      requestId: null,
      verificationResult: null,
      transactionHash: null,
      isVerificationSuccessful: false,
    });
    setShouldPoll(false);
    setPollingStartTime(null);
  }, []);

  return {
    ...state,
    loading: state.isLoading || state.isSending,
    verifyTransaction,
    reset,
    isInitialized: !!contractRefs.current.marketplace,
  };
};

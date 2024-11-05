import { useState, useCallback, useRef } from 'react';
import { useEffect } from 'react';
import { config } from '@/abi';
import AIPromptMarketplace from '@/abi/AIPromptMarketplace.json';
import { ethers, type Eip1193Provider } from 'ethers';
import { useSmartAccount } from '@particle-network/connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';

const MINIMAL_SEDA_PROVER_ABI = [
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'id',
        type: 'bytes32',
      },
    ],
    name: 'getDataResult',
    outputs: [
      {
        components: [
          {
            internalType: 'string',
            name: 'version',
            type: 'string',
          },
          {
            internalType: 'bytes32',
            name: 'dr_id',
            type: 'bytes32',
          },
          {
            internalType: 'bool',
            name: 'consensus',
            type: 'bool',
          },
          {
            internalType: 'uint8',
            name: 'exit_code',
            type: 'uint8',
          },
          {
            internalType: 'bytes',
            name: 'result',
            type: 'bytes',
          },
          {
            internalType: 'uint64',
            name: 'block_height',
            type: 'uint64',
          },
          {
            internalType: 'uint128',
            name: 'gas_used',
            type: 'uint128',
          },
          {
            internalType: 'bytes',
            name: 'payback_address',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'seda_payload',
            type: 'bytes',
          },
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

interface PromptGenerationState {
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  requestId: string | null;
  generatedPrompt: string | null;
  transactionHash: string | null;
}

export const usePromptGeneration = (
  pollingInterval = 5000,
  maxPollingTime = 180000
) => {
  const smartAccount = useSmartAccount();
  const providerRef = useRef<ethers.Provider | null>(null);
  const marketplaceRef = useRef<ethers.Contract | null>(null);
  const signerRef = useRef<ethers.Signer | null>(null);

  const [state, setState] = useState<PromptGenerationState>({
    isLoading: false,
    isSending: false,
    error: null,
    requestId: null,
    generatedPrompt: null,
    transactionHash: null,
  });

  const [shouldPoll, setShouldPoll] = useState(false);
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    const initContract = async () => {
      if (!smartAccount) {
        console.log('🔄 Waiting for smart account...');
        return;
      }

      try {
        console.log(
          '🔄 Initializing contract with smart account:',
          smartAccount
        );

        const customProvider = new ethers.BrowserProvider(
          new AAWrapProvider(
            smartAccount,
            SendTransactionMode.Gasless
          ) as Eip1193Provider,
          'any'
        );
        console.log('✅ Custom provider initialized with gasless mode');

        if (!mounted) return;

        providerRef.current = customProvider;
        const newSigner = await customProvider.getSigner();
        console.log('✅ Signer obtained:', await newSigner.getAddress());
        signerRef.current = newSigner;

        const newMarketplace = new ethers.Contract(
          config.AIPromptMarketplace,
          AIPromptMarketplace,
          newSigner
        );
        console.log(
          '✅ Marketplace contract initialized at:',
          config.AIPromptMarketplace
        );
        marketplaceRef.current = newMarketplace;
      } catch (error) {
        console.error('❌ Error initializing contract:', error);
      }
    };

    initContract();
    return () => {
      mounted = false;
      console.log('🧹 Cleanup: Contract initialization effect unmounted');
    };
  }, [smartAccount]);

  const pollPrompt = useCallback(async () => {
    if (
      !state.requestId ||
      !shouldPoll ||
      !pollingStartTime ||
      !marketplaceRef.current ||
      !providerRef.current
    ) {
      console.log('⏳ Polling skipped, checking prerequisites:', {
        hasRequestId: !!state.requestId,
        shouldPoll,
        hasPollingStartTime: !!pollingStartTime,
        hasMarketplace: !!marketplaceRef.current,
        hasProvider: !!providerRef.current,
        requestId: state.requestId,
      });
      return;
    }

    try {
      const elapsedTime = Date.now() - pollingStartTime;
      console.log('🔄 Polling attempt:', {
        requestId: state.requestId,
        elapsedTimeSeconds: (elapsedTime / 1000).toFixed(1),
        maxTimeSeconds: (maxPollingTime / 1000).toFixed(1),
        timestamp: new Date().toISOString(),
      });

      if (elapsedTime > maxPollingTime) {
        console.log('⚠️ Polling timeout reached');
        setShouldPoll(false);
        setState((prev) => ({
          ...prev,
          error: 'Polling timeout: Prompt generation took too long',
          isLoading: false,
        }));
        return;
      }

      // First try to get SEDA result
      try {
        console.log('📍 Getting SEDA Prover contract...');
        const sedaProverAddress =
          await marketplaceRef.current.sedaProverContract();
        console.log('📍 SEDA Prover address:', sedaProverAddress);

        const prover = new ethers.Contract(
          sedaProverAddress,
          MINIMAL_SEDA_PROVER_ABI,
          providerRef.current
        );

        console.log('🔍 Checking data result for request:', state.requestId);
        const result = await prover.getDataResult(state.requestId);
        console.log('📊 SEDA Result:', {
          consensus: result.consensus,
        });

        if (!result.consensus) {
          console.log('⏳ Oracle consensus not yet reached');
          console.log('Will retry in', pollingInterval / 1000, 'seconds');
          return;
        }

        console.log('✅ Consensus reached, fetching prompt...');
      } catch (error) {
        console.log('⏳ Prompt data not yet available, will retry...');
        return;
      }

      // If we got here, consensus was reached. Try to get the prompt
      try {
        const prompt = await marketplaceRef.current.getLatestPrompt();
        console.log('📄 Generated prompt:', prompt);

        const storedPrompt =
          await marketplaceRef.current.latestGeneratedPrompt();
        if (storedPrompt !== prompt) {
          console.log('📝 Stored prompt differs:', storedPrompt || '(none)');
        }

        setState((prev) => ({
          ...prev,
          generatedPrompt: prompt,
          isLoading: false,
          isSending: false,
        }));
        setShouldPoll(false);
        console.log('✅ Polling completed successfully');
      } catch (error: any) {
        if (error.message?.includes('NoPromptAvailable')) {
          console.log('⚠️ No prompt available yet');
          console.log('Will retry in', pollingInterval / 1000, 'seconds');
          return;
        } else if (error.message?.includes('PromptGenerationFailed')) {
          console.log('❌ Prompt generation failed');
          setShouldPoll(false);
          setState((prev) => ({
            ...prev,
            error: 'The SEDA network was unable to generate a prompt',
            isLoading: false,
            isSending: false,
          }));
          return;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('❌ Polling error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId: state.requestId,
        timestamp: new Date().toISOString(),
      });

      // Only stop polling for non-temporary errors
      if (error instanceof Error) {
        const isTemporaryError =
          error.message.includes('NoPromptAvailable') ||
          error.message.includes('execution reverted') ||
          error.message.includes('DataResultNotFound');

        if (!isTemporaryError) {
          setShouldPoll(false);
          setState((prev) => ({
            ...prev,
            error: error.message,
            isLoading: false,
            isSending: false,
          }));
        } else {
          console.log('⏳ Temporary error, continuing to poll...');
        }
      }
    }
  }, [
    state.requestId,
    shouldPoll,
    pollingStartTime,
    maxPollingTime,
    pollingInterval,
  ]);

  // Adjust polling interval effect
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
        pollPrompt();
      }, pollingInterval);

      // Initial poll immediately
      pollPrompt();
    }

    return () => {
      if (pollInterval) {
        console.log('🧹 Cleaning up polling interval');
        clearInterval(pollInterval);
      }
    };
  }, [shouldPoll, pollPrompt, pollingInterval, state.requestId]);

  const requestPrompt = useCallback(async (basePrompt: string) => {
    console.log('🚀 Initiating prompt request:', basePrompt);

    if (!marketplaceRef.current || !signerRef.current) {
      console.error('❌ Contract or signer not initialized');
      setState((prev) => ({
        ...prev,
        error: 'Wallet not connected or contract not initialized',
        isLoading: false,
        isSending: false,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      isSending: true,
      error: null,
    }));

    try {
      const isPaused = await marketplaceRef.current.paused();
      if (isPaused) {
        console.error('❌ Marketplace is paused');
        throw new Error('Marketplace is currently paused');
      }

      console.log('📝 Preparing transaction...');
      const tx =
        await marketplaceRef.current.requestPromptGeneration.populateTransaction(
          basePrompt
        );
      console.log('📤 Transaction data:', tx);

      console.log('🔄 Sending transaction...');
      const txResponse = await signerRef.current.sendTransaction(tx);
      console.log('📬 Transaction sent:', txResponse.hash);

      console.log('⏳ Waiting for transaction confirmation...');
      const receipt = await txResponse.wait();
      console.log('✅ Transaction confirmed:', receipt);

      setState((prev) => ({
        ...prev,
        transactionHash: receipt?.hash || null,
        isSending: false,
      }));

      console.log('🔍 Looking for PromptRequested event...');
      const event = receipt?.logs
        .map((log: any) => {
          try {
            return marketplaceRef.current!.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .find((event: any) => event?.name === 'PromptRequested');

      if (event && 'args' in event) {
        const requestId = event.args.requestId;
        console.log('✅ Request ID received:', requestId);
        setState((prev) => ({ ...prev, requestId }));
        setShouldPoll(true);
        setPollingStartTime(Date.now());
        console.log('🔄 Starting polling process...');
      } else {
        throw new Error('Failed to get request ID from event');
      }
    } catch (error) {
      console.error('❌ Error in request:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
        isLoading: false,
        isSending: false,
      }));
    }
  }, []);

  const reset = useCallback(() => {
    console.log('🔄 Resetting prompt generation state');
    setState({
      isLoading: false,
      isSending: false,
      error: null,
      requestId: null,
      generatedPrompt: null,
      transactionHash: null,
    });
    setShouldPoll(false);
    setPollingStartTime(null);
  }, []);

  // Log state changes
  useEffect(() => {
    console.log('📊 Current State:', {
      isLoading: state.isLoading,
      isSending: state.isSending,
      error: state.error,
      requestId: state.requestId,
      generatedPrompt: state.generatedPrompt,
      transactionHash: state.transactionHash,
      shouldPoll,
      pollingStartTime,
      isInitialized: !!marketplaceRef.current && !!signerRef.current,
    });
  }, [state, shouldPoll, pollingStartTime]);

  return {
    ...state,
    loading: state.isLoading || state.isSending,
    requestPrompt,
    reset,
    isInitialized: !!marketplaceRef.current && !!signerRef.current,
  };
};

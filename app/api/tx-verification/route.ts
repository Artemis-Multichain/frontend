import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { getChainConfig } from '@/abi';
import AIPromptMarketplace from '@/abi/AIPromptMarketplace.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SUPPORTED_CHAINS = {
  BASE_SEPOLIA: '84532',
  ARBITRUM_SEPOLIA: '421614',
} as const;

type ChainId = (typeof SUPPORTED_CHAINS)[keyof typeof SUPPORTED_CHAINS];

const getChainName = (chainId: ChainId) => {
  switch (chainId) {
    case SUPPORTED_CHAINS.BASE_SEPOLIA:
      return 'Base Sepolia';
    case SUPPORTED_CHAINS.ARBITRUM_SEPOLIA:
      return 'Arbitrum Sepolia';
    default:
      return 'Unknown Chain';
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { txHash, chainId } = body;

    console.log('Received request with chain ID:', chainId);

    if (!txHash || !chainId) {
      return NextResponse.json(
        { error: 'Transaction hash and chain ID are required' },
        { status: 400 }
      );
    }

    // Validate chain ID
    if (
      ![
        SUPPORTED_CHAINS.BASE_SEPOLIA,
        SUPPORTED_CHAINS.ARBITRUM_SEPOLIA,
      ].includes(chainId)
    ) {
      return NextResponse.json(
        { error: `Unsupported chain ID: ${chainId}` },
        { status: 400 }
      );
    }

    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Use Base Sepolia for verifier contract but preserve original chainId
    const verifierChainConfig = getChainConfig(84532);
    const provider = new ethers.JsonRpcProvider(verifierChainConfig.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    const marketplace = new ethers.Contract(
      verifierChainConfig.AIPromptMarketplace,
      AIPromptMarketplace,
      signer
    );

    const isPaused = await marketplace.paused();
    if (isPaused) {
      return NextResponse.json(
        { error: 'Marketplace is currently paused' },
        { status: 503 }
      );
    }

    // Format txData with the original chainId
    const txData = `${chainId}-${txHash}`;
    console.log('Processing with chainId:', chainId);
    console.log('Formatted txData:', txData);

    const tx = await marketplace.requestTxProcessing(txData);
    const receipt = await tx.wait();

    const event = receipt?.logs
      .map((log: any) => {
        try {
          return marketplace.interface.parseLog({
            topics: [...log.topics],
            data: log.data,
          });
        } catch {
          return null;
        }
      })
      .find((event: any) => event?.name === 'TxRequested');

    if (!event || !('args' in event)) {
      return NextResponse.json(
        { error: 'Failed to get request ID from event' },
        { status: 500 }
      );
    }

    // Return the exact chain ID that was passed in
    const response = {
      requestId: event.args.requestId,
      txData: event.args.txData,
      transactionHash: receipt.hash,
      chain: {
        id: chainId, 
        name: getChainName(chainId as ChainId),
      },
    };

    console.log('Sending response:', response);

    return NextResponse.json(response);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  );
}

import { ethers } from 'ethers';
import { NextRequest, NextResponse } from 'next/server';
import { getChainConfig } from '@/abi';
import AIPromptMarketplace from '@/abi/AIPromptMarketplace.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { txHash, chainId = '84532' } = body;

    if (!txHash) {
      return NextResponse.json(
        { error: 'Transaction hash is required' },
        { status: 400 }
      );
    }

    const chainConfig = getChainConfig(84532); // Base Sepolia for verifier
    const provider = new ethers.JsonRpcProvider(chainConfig.rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);

    const marketplace = new ethers.Contract(
      chainConfig.AIPromptMarketplace,
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

    const txData = `${chainId}-${txHash}`;
    console.log('Submitting verification request:', {
      chainId,
      txHash,
      formattedData: txData,
    });

    const tx = await marketplace.requestTxProcessing(txData);
    console.log('Verification tx submitted:', tx.hash);

    const receipt = await tx.wait();
    console.log('Verification tx confirmed:', receipt.hash);

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

    return NextResponse.json({
      requestId: event.args.requestId,
      txData: event.args.txData,
      transactionHash: receipt.hash,
      chain: {
        id: chainId,
        name: chainId === '84532' ? 'Base Sepolia' : 'Unknown',
      },
    });
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

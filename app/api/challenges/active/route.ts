import { createPublicClient, http, parseAbiItem, Address } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { NextResponse } from 'next/server';
import type { Abi } from 'viem';

const ABI = [
  {
    name: 'getActiveChallenges',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256[]' }],
  },
  {
    name: 'getChallengeDetails',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [
      { name: 'ipfsUrl', type: 'string' },
      { name: 'duration', type: 'uint256' },
      { name: 'startTime', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'winner', type: 'address' },
      { name: 'prizeAmount', type: 'uint256' },
      { name: 'prizeType', type: 'uint8' },
    ],
  },
  {
    name: 'getNumberOfSubmissions',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'challengeId', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  parseAbiItem(
    'event ChallengeCreated(uint256 indexed challengeId, string ipfsUrl, uint256 duration, uint256 prizeAmount, uint8 prizeType)'
  ),
] as const satisfies Abi;

const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;
const CHALLENGES_ADDRESS =
  process.env.NEXT_PUBLIC_ARTEMIS_CHALLENGES_ADDRESS as Address;

interface Challenge {
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
}

interface ChallengeStats {
  totalChallenges: number;
  totalPrizePool: {
    eth: string;
    usdc: string;
  };
  totalSubmissions: number;
  averageSubmissions: number;
  failedToLoad: number;
}

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(ALCHEMY_RPC_URL, {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 20000,
    batch: {
      batchSize: 1024,
      wait: 16,
    },
  }),
});

async function fetchChallengeDetails(id: bigint): Promise<Challenge | null> {
  try {
    const [
      ipfsUrl,
      duration,
      startTime,
      isActive,
      winner,
      prizeAmount,
      prizeType,
    ] = await client.readContract({
      address: CHALLENGES_ADDRESS,
      abi: ABI,
      functionName: 'getChallengeDetails',
      args: [id],
    });

    // Verify if the challenge is truly active
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = Number(startTime) + Number(duration);
    if (!isActive || currentTime >= endTime) {
      console.log(`Challenge ${id} is no longer active`);
      return null;
    }

    // Get number of submissions with retry
    let numSubmissions;
    try {
      numSubmissions = await client.readContract({
        address: CHALLENGES_ADDRESS,
        abi: ABI,
        functionName: 'getNumberOfSubmissions',
        args: [id],
      });
    } catch (error) {
      console.error(`Failed to get submissions for challenge ${id}:`, error);
      numSubmissions = BigInt(0);
    }

    const timeRemaining = endTime - currentTime;

    return {
      id: Number(id),
      ipfsUrl,
      duration: Number(duration),
      startTime: Number(startTime),
      endTime,
      isActive,
      winner,
      prizeAmount: prizeAmount.toString(),
      prizeType: Number(prizeType) === 1 ? 'USDC' : 'ETH',
      numSubmissions: Number(numSubmissions),
      timeRemaining,
    };
  } catch (error) {
    console.error(`Failed to fetch details for challenge ${id}:`, error);
    return null;
  }
}

export async function GET() {
  try {
    // Get active challenge IDs with retry logic
    let activeChallengeIds: readonly bigint[] = [];
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        activeChallengeIds = (await client.readContract({
          address: CHALLENGES_ADDRESS,
          abi: ABI,
          functionName: 'getActiveChallenges',
        })) as readonly bigint[];
        break;
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;
        if (retryCount === maxRetries) {
          throw new Error(
            'Failed to fetch active challenges after multiple attempts'
          );
        }
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    // Fetch details for each challenge with a timeout
    const challengePromises = activeChallengeIds.map((id) => {
      return Promise.race([
        fetchChallengeDetails(id),
        new Promise<null>((resolve) =>
          setTimeout(() => {
            console.log(`Timeout fetching challenge ${id}`);
            resolve(null);
          }, 5000)
        ), // 5 second timeout
      ]);
    });

    const challengeResults = await Promise.all(challengePromises);
    const challenges = challengeResults.filter(
      (c): c is Challenge => c !== null
    );

    const failedToLoad = challengeResults.filter((r) => r === null).length;

    // Sort by end time and filter out any expired challenges
    const currentTime = Math.floor(Date.now() / 1000);
    const sortedChallenges = challenges
      .filter((c) => c.endTime > currentTime)
      .sort((a, b) => a.endTime - b.endTime);

    const stats: ChallengeStats = {
      totalChallenges: challenges.length,
      totalPrizePool: {
        eth: challenges
          .filter((c) => c.prizeType === 'ETH')
          .reduce((sum, c) => sum + BigInt(c.prizeAmount), BigInt(0))
          .toString(),
        usdc: challenges
          .filter((c) => c.prizeType === 'USDC')
          .reduce((sum, c) => sum + BigInt(c.prizeAmount), BigInt(0))
          .toString(),
      },
      totalSubmissions: challenges.reduce(
        (sum, c) => sum + c.numSubmissions,
        0
      ),
      averageSubmissions:
        challenges.length > 0
          ? challenges.reduce((sum, c) => sum + c.numSubmissions, 0) /
            challenges.length
          : 0,
      failedToLoad,
    };

    return NextResponse.json({
      status: 'success',
      data: {
        challenges: sortedChallenges,
        stats,
      },
      meta: {
        chain: arbitrumSepolia.name,
        contractAddress: CHALLENGES_ADDRESS,
        timestamp: new Date().toISOString(),
        totalAttempted: activeChallengeIds.length,
        successfullyLoaded: challenges.length,
        failedToLoad,
      },
    });
  } catch (error) {
    console.error('Error fetching active challenges:', error);

    return NextResponse.json(
      {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
        meta: {
          chain: arbitrumSepolia.name,
          contractAddress: CHALLENGES_ADDRESS,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

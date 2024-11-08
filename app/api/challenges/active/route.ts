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

const CHALLENGES_ADDRESS =
  '0xd6555A99D4C85103477f39aa62F5a1300ec952B1' as Address;

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
}

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(),
});

export async function GET() {
  try {
    const activeChallengeIds = (await client.readContract({
      address: CHALLENGES_ADDRESS,
      abi: ABI,
      functionName: 'getActiveChallenges',
    })) as readonly bigint[];

    const challenges: Challenge[] = await Promise.all(
      activeChallengeIds.map(async (id) => {
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

        // Get number of submissions
        const numSubmissions = await client.readContract({
          address: CHALLENGES_ADDRESS,
          abi: ABI,
          functionName: 'getNumberOfSubmissions',
          args: [id],
        });

        const currentTime = Math.floor(Date.now() / 1000);
        const endTime = Number(startTime) + Number(duration);
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
      })
    );

    const sortedChallenges = challenges.sort((a, b) => a.endTime - b.endTime);

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

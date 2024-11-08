import { createPublicClient, http, parseAbiItem, Address } from 'viem';
import { arbitrumSepolia } from 'viem/chains';
import { NextResponse } from 'next/server';
import type { Abi } from 'viem';

const ALCHEMY_RPC_URL = process.env.NEXT_PUBLIC_ARBITRUM_RPC_URL;
const CHALLENGES_ADDRESS = process.env
  .NEXT_PUBLIC_ARTEMIS_CHALLENGES_ADDRESS as Address;

const ABI = [
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
  {
    name: 'getSubmission',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'submissionIndex', type: 'uint256' },
    ],
    outputs: [
      { name: 'ipfsHash', type: 'string' },
      { name: 'submitter', type: 'address' },
      { name: 'voteCount', type: 'uint256' },
    ],
  },
] as const satisfies Abi;

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(ALCHEMY_RPC_URL, {
    retryCount: 3,
    retryDelay: 1000,
    timeout: 20000,
  }),
});

export async function GET(
  request: Request,
  { params }: { params: { challengeId: string } }
) {
  try {
    const challengeId = BigInt(params.challengeId);

    // Get challenge details
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
      args: [challengeId],
    });

    // Get number of submissions
    const submissionCount = await client.readContract({
      address: CHALLENGES_ADDRESS,
      abi: ABI,
      functionName: 'getNumberOfSubmissions',
      args: [challengeId],
    });

    // Fetch all submissions
    const submissions = await Promise.all(
      Array.from({ length: Number(submissionCount) }, async (_, index) => {
        try {
          const [ipfsHash, submitter, voteCount] = await client.readContract({
            address: CHALLENGES_ADDRESS,
            abi: ABI,
            functionName: 'getSubmission',
            args: [challengeId, BigInt(index)],
          });

          return {
            index,
            ipfsHash,
            submitter,
            voteCount: Number(voteCount),
          };
        } catch (error) {
          console.error(`Failed to fetch submission ${index}:`, error);
          return null;
        }
      })
    );

    // Filter out failed submissions
    const validSubmissions = submissions.filter(
      (s): s is NonNullable<typeof s> => s !== null
    );

    const stats = {
      totalSubmissions: validSubmissions.length,
      uniqueSubmitters: new Set(validSubmissions.map((s) => s.submitter)).size,
      totalVotes: validSubmissions.reduce((sum, s) => sum + s.voteCount, 0),
      averageVotes:
        validSubmissions.length > 0
          ? validSubmissions.reduce((sum, s) => sum + s.voteCount, 0) /
            validSubmissions.length
          : 0,
    };

    return NextResponse.json({
      status: 'success',
      data: {
        challenge: {
          ipfsUrl,
          duration: Number(duration),
          startTime: Number(startTime),
          isActive,
          winner,
          prizeAmount: prizeAmount.toString(),
          prizeType: Number(prizeType) === 1 ? 'USDC' : 'ETH',
        },
        submissions: validSubmissions,
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      {
        status: 'error',
        message:
          error instanceof Error ? error.message : 'An unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

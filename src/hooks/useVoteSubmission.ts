import { ethers, type Eip1193Provider } from 'ethers';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { useAccount, useSmartAccount } from '@particle-network/connectkit';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useState } from 'react';

const CHALLENGES_ADDRESS = process.env.NEXT_PUBLIC_ARTEMIS_CHALLENGES_ADDRESS as string;

interface VotingState {
  setLocalVoteCounts: React.Dispatch<
    React.SetStateAction<Record<number, number>>
  >;
  setVotingSubmissionId: React.Dispatch<React.SetStateAction<number | null>>;
}

const CHALLENGES_ABI = [
  {
    name: 'voteForSolution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'submissionIndex', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'hasUserVotedInChallenge',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'user', type: 'address' },
    ],
    outputs: [{ type: 'bool' }],
  },
] as const;

export const useVoteSubmission = (
  challengeId: string,
  votingState: VotingState
) => {
  const { isConnected } = useAccount();
  const smartAccount = useSmartAccount();
  const queryClient = useQueryClient();
  const { setLocalVoteCounts, setVotingSubmissionId } = votingState;

  const customProvider = smartAccount
    ? new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.Gasless
        ) as Eip1193Provider,
        'any'
      )
    : null;

  const handleVote = async (submissionIndex: number) => {
    if (!smartAccount || !customProvider) {
      toast.error('Please connect your wallet first');
      return;
    }

    setVotingSubmissionId(submissionIndex);
    const voteNotification = toast.loading('Processing vote...');

    try {
      const signer = await customProvider.getSigner();
      const contract = new ethers.Contract(
        CHALLENGES_ADDRESS,
        CHALLENGES_ABI,
        signer
      );

      // Check if user has already voted
      const hasVoted = await contract.hasUserVotedInChallenge(
        BigInt(challengeId),
        await signer.getAddress()
      );

      if (hasVoted) {
        toast.update(voteNotification, {
          render: 'You have already voted for this challenge',
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
        return;
      }

      // Submit vote transaction
      const tx = await contract.voteForSolution.populateTransaction(
        BigInt(challengeId),
        BigInt(submissionIndex)
      );

      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();

      // Update local state and UI
      setLocalVoteCounts((prev) => ({
        ...prev,
        [submissionIndex]: (prev[submissionIndex] || 0) + 1,
      }));

      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({
        queryKey: ['submissions', challengeId],
      });

      toast.update(voteNotification, {
        render: 'Vote submitted successfully! 🎉',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });
    } catch (error) {
      console.error('Error voting:', error);
      toast.update(voteNotification, {
        render: `Error: ${
          error instanceof Error ? error.message : 'Failed to submit vote'
        }`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setVotingSubmissionId(null);
    }
  };

  return { handleVote };
};

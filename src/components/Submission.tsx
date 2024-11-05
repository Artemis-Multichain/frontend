// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SubmissionsHeader from './SubmissionsHeader';
import SubmissionCard from './cards/SubmissionCard';
import SubmissionCardSkeleton from './skeleton/SubmissionCardSkeleton';
import {
  voteSubmission,
  voteSubmissionSponsored,
} from '@/utils/entry-functions/vote_submission';

interface Submission {
  submission_id: string;
  creator: string;
  ipfs_uri: string;
  vote_count: number;
  timestamp: string;
}

const fetchSubmissions = async (challengeId: string): Promise<Submission[]> => {
  const response = await fetch(`/api/submissions/${challengeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
};

const Submissions = () => {
  const router = useRouter();
  const { id: challengeId } = router.query;
  const queryClient = useQueryClient();
  const [localVoteCounts, setLocalVoteCounts] = useState<
    Record<string, number>
  >({});
  const [votingSubmissionId, setVotingSubmissionId] = useState<string | null>(
    null
  );

  const {
    data: submissions,
    isLoading,
    error,
  } = useQuery<Submission[], Error>({
    queryKey: ['submissions', challengeId],
    queryFn: () => fetchSubmissions(challengeId as string),
    enabled: !!challengeId,
    onError: (error) => {
      toast.error(`Failed to load submissions: ${error.message}`);
    },
  });

  useEffect(() => {
    if (submissions) {
      const initialCounts = submissions.reduce((acc, submission) => {
        acc[submission.submission_id] = submission.vote_count;
        return acc;
      }, {} as Record<string, number>);
      setLocalVoteCounts(initialCounts);
    }
  }, [submissions]);

  const voteForSubmission = async (submissionId: string) => {
    if (!account || account.address === null) {
      toast.error('Please connect your wallet first');
      return;
    }

    setVotingSubmissionId(submissionId);
    let voteNotification;

    try {
      voteNotification = toast.loading('Processing your vote...');

      const isPetraWallet = window.petra && wallet?.name === 'Petra';
      let txHash;

      if (txHash) {
        toast.update(voteNotification, {
          render: 'Vote submitted successfully',
          type: 'success',
          isLoading: false,
          autoClose: 5000,
        });

        // Increase the vote count only after successful submission
        setLocalVoteCounts((prev) => ({
          ...prev,
          [submissionId]: (prev[submissionId] || 0) + 1,
        }));

        // Invalidate and refetch the submissions query
        queryClient.invalidateQueries(['submissions', challengeId]);
      } else {
        throw new Error('Failed to submit transaction');
      }
    } catch (error) {
      console.error('Error in voting process:', error);
      if (voteNotification) {
        toast.update(voteNotification, {
          render: `Voting failed: ${error.message}`,
          type: 'error',
          isLoading: false,
          autoClose: 5000,
        });
      } else {
        toast.error(`Voting failed: ${error.message}`, {
          autoClose: 5000,
        });
      }
    } finally {
      setVotingSubmissionId(null);
    }
  };

  return (
    <div className="w-full pb-20 min-h-screen">
      {typeof challengeId === 'string' && (
        <SubmissionsHeader tokenId={challengeId} />
      )}
      <div className="ml-[250px]">
        {isLoading ? (
          <React.Fragment>
            <SubmissionCardSkeleton />
            <SubmissionCardSkeleton />
            <SubmissionCardSkeleton />
          </React.Fragment>
        ) : error ? (
          <p className="text-red-500">
            Error loading submissions. Please try again.
          </p>
        ) : submissions && submissions.length > 0 ? (
          submissions.map((submission) => (
            <SubmissionCard
              key={submission.submission_id}
              ipfsHash={submission.ipfs_uri}
              voteCount={
                localVoteCounts[submission.submission_id]?.toString() || '0'
              }
              onVote={() => voteForSubmission(submission.submission_id)}
              submitter={submission.creator}
              isVoting={votingSubmissionId === submission.submission_id}
            />
          ))
        ) : (
          <p className="text-white">No submissions found for this challenge.</p>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Submissions;

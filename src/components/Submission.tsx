'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, useParams } from 'next/navigation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SubmissionsHeader from './SubmissionsHeader';
import SubmissionCard from './cards/SubmissionCard';
import SubmissionCardSkeleton from './skeleton/SubmissionCardSkeleton';
import type { ApiResponse, Submission } from './types';
import { useVoteSubmission } from '@/hooks/useVoteSubmission';

const fetchSubmissions = async (challengeId: string): Promise<ApiResponse> => {
  const response = await fetch(`/api/challenges/${challengeId}/submissions`);
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
};

const Submissions = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const challengeId = params.id as string;
  const chain = searchParams.get('chain');
  const ipfsUri = searchParams.get('ipfsUri');

  const [localVoteCounts, setLocalVoteCounts] = useState<
    Record<number, number>
  >({});
  const [votingSubmissionId, setVotingSubmissionId] = useState<number | null>(
    null
  );

  const { data, isLoading, error } = useQuery<ApiResponse, Error>({
    queryKey: ['submissions', challengeId],
    queryFn: () => fetchSubmissions(challengeId),
    enabled: !!challengeId,
    onError: (error) => {
      toast.error(`Failed to load submissions: ${error.message}`);
    },
  });

  useEffect(() => {
    if (data?.data.submissions) {
      const initialCounts = data.data.submissions.reduce((acc, submission) => {
        acc[submission.index] = submission.voteCount;
        return acc;
      }, {} as Record<number, number>);
      setLocalVoteCounts(initialCounts);
    }
  }, [data?.data.submissions]);

  const votingState = {
    setLocalVoteCounts,
    setVotingSubmissionId,
  };

  const { handleVote } = useVoteSubmission(challengeId, votingState);

  if (isLoading) {
    return (
      <div className="w-full pb-20 min-h-screen">
        <div className="ml-[250px]">
          <SubmissionCardSkeleton />
          <SubmissionCardSkeleton />
          <SubmissionCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full pb-20 min-h-screen">
        <div className="ml-[250px]">
          <p className="text-red-500">
            Error loading submissions. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-20 min-h-screen">
      <SubmissionsHeader
        challengeName={data?.data.challenge.ipfsUrl}
        stats={data?.data.stats}
      />
      <div className="ml-[250px]">
        {data?.data.submissions && data.data.submissions.length > 0 ? (
          data.data.submissions.map((submission) => (
            <SubmissionCard
              key={submission.index}
              ipfsHash={submission.ipfsHash}
              voteCount={
                localVoteCounts[submission.index] || submission.voteCount
              }
              onVote={() => handleVote(submission.index)}
              submitter={submission.submitter}
              isVoting={votingSubmissionId === submission.index}
              chain={chain || undefined}
              ipfsUri={ipfsUri || undefined}
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

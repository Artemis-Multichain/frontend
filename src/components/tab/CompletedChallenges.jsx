import React from 'react';
import { useQuery } from '@tanstack/react-query';
import CompletedChallengesCard from '../cards/CompletedChallengesCard';
import ChallengesCardSkeleton from '../skeleton/ChallengesCardSkeleton';
import getChallengeImage from '@/utils/challengeImageGenerator';

const challengeImage = getChallengeImage();

const fetchCompletedChallenges = async () => {
  const response = await fetch('/api/challenges/completed');
  if (!response.ok) {
    throw new Error('Failed to fetch completed challenges');
  }
  return response.json();
};

const CompletedChallenges = () => {
  const {
    data: completedChallenges,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['completedChallenges'],
    queryFn: fetchCompletedChallenges,
  });

  if (error) {
    return <div>Error fetching completed challenges: {error.message}</div>;
  }

  const reversedChallenges = completedChallenges
    ? [...completedChallenges].reverse()
    : [];

  return (
    <div className="flex justify-start items-center">
      <div className="text-white w-full grid grid-cols-3 md:grid-cols-3 gap-[60px] mx-[20px]">
        {isLoading ? (
          <React.Fragment>
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
          </React.Fragment>
        ) : (
          reversedChallenges.map((challenge) => (
            <CompletedChallengesCard
              key={challenge.challenge_id}
              id={challenge.challenge_id}
              ipfsUrl={challenge.ipfs_uri}
              duration={challenge.duration}
              startTime={challenge.start_time}
              endTime={challenge.end_time}
              isActive={false}
              numberOfSubmissions={challenge.numberOfSubmissions}
              challengeImage={challengeImage}
              winner={challenge.winner}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CompletedChallenges;

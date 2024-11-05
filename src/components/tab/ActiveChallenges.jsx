import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ActiveChallengesCard from '../cards/ActiveChallengesCard';
import ChallengesCardSkeleton from '../skeleton/ChallengesCardSkeleton';
import getChallengeImage from '@/utils/challengeImageGenerator';
import { octasToApt } from '@/utils/aptos/octasToApt';

const challengeImage = getChallengeImage();

const fetchActiveChallenges = async () => {
  const response = await fetch('/api/challenges/active');
  if (!response.ok) {
    throw new Error('Failed to fetch active challenges');
  }
  return response.json();
};

const ActiveChallenges = () => {
  const {
    data: activeChallenges,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: fetchActiveChallenges,
  });

  if (error) {
    return <div>Error fetching challenges: {error.message}</div>;
  }

  return (
    <div className="flex justify-start items-start">
      <div className="text-white w-full grid grid-cols-3 md:grid-cols-3 gap-[60px] mx-[20px]">
        {isLoading ? (
          <React.Fragment>
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
          </React.Fragment>
        ) : (
          activeChallenges.map((challenge) => (
            <ActiveChallengesCard
              key={challenge.challenge_id}
              id={challenge.challenge_id}
              ipfsUrl={challenge.ipfs_uri}
              duration={challenge.duration}
              startTime={challenge.start_time}
              isActive={true}
              prize={octasToApt(challenge.prize)}
              numberOfSubmissions={challenge.numberOfSubmissions}
              challengeImage={challengeImage}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveChallenges;

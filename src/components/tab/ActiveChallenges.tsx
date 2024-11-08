import React from 'react';
import { useQuery } from '@tanstack/react-query';
import ActiveChallengesCard from '../cards/ActiveChallengesCard';
import ChallengesCardSkeleton from '../skeleton/ChallengesCardSkeleton';
import getChallengeImage from '@/utils/challengeImageGenerator';

interface ChallengeResponse {
  status: 'success' | 'error';
  data: {
    challenges: Array<{
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
    }>;
    stats: {
      totalChallenges: number;
      totalPrizePool: {
        eth: string;
        usdc: string;
      };
      totalSubmissions: number;
      averageSubmissions: number;
    };
  };
  meta: {
    chain: string;
    contractAddress: string;
    timestamp: string;
  };
}

const challengeImage = getChallengeImage();

const fetchActiveChallenges = async (): Promise<ChallengeResponse> => {
  const response = await fetch('/api/challenges/active');
  if (!response.ok) {
    throw new Error('Failed to fetch active challenges');
  }
  return response.json();
};

const formatPrize = (amount: string, type: 'ETH' | 'USDC'): string => {
  if (type === 'USDC') {
    return `${Number(amount) / 1_000_000} USDC`;
  }
  // Format ETH with 4 decimal places
  return `${(Number(amount) / 1e18).toFixed(4)} ETH`;
};

const ActiveChallenges = () => {
  const {
    data: challengeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['activeChallenges'],
    queryFn: fetchActiveChallenges,
  });

  console.log('Challenge Data:', challengeData);
  
  if (error) {
    return (
      <div className="text-white p-4 bg-red-500/10 rounded-lg">
        Error fetching challenges:{' '}
        {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  // Optional: Add stats display
  const renderStats = () => {
    if (!challengeData?.data.stats) return null;

    const { stats } = challengeData.data;
    return (
      <div className="col-span-3 mb-6 p-4 bg-gray-800/50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Challenge Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-400">Total Challenges</p>
            <p className="text-xl">{stats.totalChallenges}</p>
          </div>
          <div>
            <p className="text-gray-400">Total Submissions</p>
            <p className="text-xl">{stats.totalSubmissions}</p>
          </div>
          <div>
            <p className="text-gray-400">Prize Pool</p>
            <p className="text-lg">
              {Number(stats.totalPrizePool.eth) > 0 &&
                `${(Number(stats.totalPrizePool.eth) / 1e18).toFixed(4)} ETH`}
              {Number(stats.totalPrizePool.eth) > 0 &&
                Number(stats.totalPrizePool.usdc) > 0 &&
                ' + '}
              {Number(stats.totalPrizePool.usdc) > 0 &&
                `${Number(stats.totalPrizePool.usdc) / 1_000_000} USDC`}
            </p>
          </div>
          <div>
            <p className="text-gray-400">Avg. Submissions</p>
            <p className="text-xl">{stats.averageSubmissions.toFixed(1)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full">
      {/* {!isLoading && renderStats()} */}
      <div className="text-white w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[60px] mx-[20px]">
        {isLoading ? (
          <React.Fragment>
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
            <ChallengesCardSkeleton />
          </React.Fragment>
        ) : challengeData?.data.challenges.length === 0 ? (
          <div className="col-span-3 text-center py-8">
            <p className="text-xl">No active challenges at the moment</p>
            <p className="text-gray-400 mt-2">
              Check back later for new challenges
            </p>
          </div>
        ) : (
          challengeData?.data.challenges.map((challenge) => (
            <ActiveChallengesCard
              key={challenge.id}
              id={challenge.id}
              ipfsUrl={challenge.ipfsUrl}
              duration={challenge.duration}
              startTime={challenge.startTime}
              isActive={challenge.isActive}
              prize={formatPrize(challenge.prizeAmount, challenge.prizeType)}
              numberOfSubmissions={challenge.numSubmissions}
              challengeImage={challengeImage}
              timeRemaining={challenge.timeRemaining}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveChallenges;

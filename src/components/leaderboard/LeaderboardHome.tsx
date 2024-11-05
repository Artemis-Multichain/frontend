import React from 'react';
import Image from 'next/image';

interface LeaderboardUser {
  user_account: string;
  total_generations?: number;
  streak_days?: number;
}

interface LeaderboardProps {
  generationsData: LeaderboardUser[];
  streaksData: LeaderboardUser[];
  isLoadingGenerations: boolean;
  isLoadingStreaks: boolean;
}

const getDicebearUrl = (seed: string) =>
  `https://api.dicebear.com/6.x/bottts/svg?seed=${encodeURIComponent(seed)}`;

const UserRow: React.FC<{
  user: LeaderboardUser;
  index: number;
  type: 'generations' | 'streaks';
}> = ({ user, index, type }) => (
  <div className="flex items-center py-2 border-b border-gray-700 text-[14px]">
    <span className="w-8 text-gray-400">{index + 1}.</span>
    <div className="flex items-center flex-1">
      <img
        src={getDicebearUrl(user.user_account)}
        alt={`Avatar for ${user.user_account}`}
        width={24}
        height={24}
        className="rounded-full mr-2"
      />
      <span className="text-white">
        {user.user_account.slice(0, 6)}...{user.user_account.slice(-4)}
      </span>
    </div>
    <span className="w-20 text-right text-gray-400">
      {type === 'generations' ? user.total_generations : user.streak_days}
    </span>
    <span className="w-32 text-right text-blue-400">🔥</span>
  </div>
);

const LeaderboardSection: React.FC<{
  title: string;
  users: LeaderboardUser[];
  type: 'generations' | 'streaks';
  isLoading: boolean;
}> = ({ title, users, type, isLoading }) => {
  const sortedUsers = users?.slice().sort((a, b) => {
    const valueA = type === 'generations' ? a.total_generations : a.streak_days;
    const valueB = type === 'generations' ? b.total_generations : b.streak_days;
    return (valueB || 0) - (valueA || 0);
  });

  return (
    <div className="border border-slate-700 rounded-lg p-4 flex-1">
      <h2 className="text-lg font-bold text-white mb-4">{title}</h2>
      {isLoading ? (
        <div className="text-white">Loading...</div>
      ) : (
        <div className="space-y-2">
          {sortedUsers &&
            sortedUsers.map((user, index) => (
              <UserRow
                key={user.user_account}
                user={user}
                index={index}
                type={type}
              />
            ))}
        </div>
      )}
    </div>
  );
};

const LeaderboardHome: React.FC<LeaderboardProps> = ({
  generationsData,
  streaksData,
  isLoadingGenerations,
  isLoadingStreaks,
}) => (
  <div className="p-3 rounded-xl min-w-[1000px] ml-[200px] mt-[4px]">
    <h1 className="text-2xl font-bold text-white mb-3">Leaderboard</h1>
    <div className="flex space-x-6">
      <LeaderboardSection
        title="TOP USERS BY 24H GENERATIONS"
        users={generationsData}
        type="generations"
        isLoading={isLoadingGenerations}
      />
      <LeaderboardSection
        title="TOP USERS BY STREAKS"
        users={streaksData}
        type="streaks"
        isLoading={isLoadingStreaks}
      />
    </div>
  </div>
);

export default LeaderboardHome;

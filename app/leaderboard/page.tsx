'use client';

import React from 'react';
import Head from 'next/head';
import { useQuery } from '@tanstack/react-query';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import LeaderboardHome from '@/components/leaderboard/LeaderboardHome';
import axios from 'axios';

const fetchLeaderboardData = async (endpoint: string) => {
  const response = await axios.get(
    `https://oyster-app-43f4r.ondigitalocean.app/docs${endpoint}`
  );
  return response.data;
};

const Leaderboard = () => {
  const { data: streaksData, isLoading: isLoadingStreaks } = useQuery(
    ['streaks'],
    () => fetchLeaderboardData('/leaderboard/streaks/?page=1&page_size=10')
  );

  const { data: generationsData, isLoading: isLoadingGenerations } = useQuery(
    ['generations'],
    () =>
      fetchLeaderboardData('/leaderboard/generations-24h/?page=1&page_size=10')
  );

  console.log(generationsData);

  return (
    <div className="bg-black min-h-screen">
      <Head>
        <title>Leaderboard | Artemys AI</title>
        <meta name="description" content="Leaderboard page" />
      </Head>
      <div className="flex">
        <Sidebar />
        <ProfileNavbar />
      </div>
      <div className="px-10">
        <LeaderboardHome
          generationsData={generationsData?.results}
          streaksData={streaksData?.results}
          isLoadingGenerations={isLoadingGenerations}
          isLoadingStreaks={isLoadingStreaks}
        />
      </div>
    </div>
  );
};

export default Leaderboard;

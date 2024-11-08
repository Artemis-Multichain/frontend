'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import Challenges from '@/components/Challenges';
import Head from 'next/head';

const ChallengesC: React.FC = () => {
  return (
    <>
      <div className="bg-black h-full">
        <Head>
          <title>Challenges | Artemys AI</title>
          <meta name="description" content="Challenges page" />
        </Head>
        <div className="flex ">
          <Sidebar />

          <ProfileNavbar />
        </div>

        <div className="mt-2">
          <Challenges />
        </div>
      </div>
    </>
  );
};

export default ChallengesC;

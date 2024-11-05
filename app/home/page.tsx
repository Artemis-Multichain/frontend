'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Metadata } from 'next';

// Dynamically import components with no SSR
const Sidebar = dynamic(() => import('@/components/Sidebar'), { ssr: false });
const ProfileNavbar = dynamic(() => import('@/components/ProfileNavbar'), {
  ssr: false,
});
const Explore = dynamic(() => import('@/components/Explore'), { ssr: false });

const Home = () => {
  return (
    <div className="bg-black h-full">
      <div className="flex">
        <Sidebar />
        <ProfileNavbar />
      </div>

      <div>
        <Explore />
      </div>
    </div>
  );
};

export default Home;

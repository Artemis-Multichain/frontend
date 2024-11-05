'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import { Metadata } from 'next';

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

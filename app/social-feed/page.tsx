'use client';

import React from 'react';
import Head from 'next/head';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import SocialHeader from '@/components/social-feed/SocialHeader';

const SocialFeed = () => {
  return (
    <>
      <div className="bg-black h-full">
        <Head>
          <title>User Feed | Artemis AI</title>
          <meta name="description" content="Home page" />
        </Head>
        <div className="flex ">
          <Sidebar />
          <ProfileNavbar />
        </div>

        <div className="">
          <SocialHeader />
        </div>
      </div>
    </>
  );
};

export default SocialFeed;

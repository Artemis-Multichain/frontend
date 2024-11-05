'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import MarketplaceHeader from '@/components/MarketplaceHeader';
import ExploreTab from '@/components/tab/MarketplaceTab';
import MarketplaceC from '@/components/MarketplaceC';
import Head from 'next/head';

const Marketplace = () => {
  return (
    <>
      <div className=" h-full bg-black">
        <Head>
          <title>Marketplace | Artemis AI</title>
          <meta name="description" content="Home page" />
        </Head>
        <div className="flex ">
          <Sidebar />

          <ProfileNavbar />
        </div>

        <div className="mt-2">
          <MarketplaceC />
        </div>
      </div>
    </>
  );
};

export default Marketplace;

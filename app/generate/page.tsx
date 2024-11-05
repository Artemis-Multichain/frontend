'use client';

// @ts-nocheck
import React from 'react';
import GenerateSidebar from '@/components/GenerateSidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import GenerateImage from '@/components/GenerateImage';
import Head from 'next/head';
import { useEffect, useState } from 'react';

const Generate = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <>
        <div className=" relative h-screen bg-black">
          <Head>
            <title>Generate Image | Artemis AI</title>
            <meta name="description" content="Home page" />
          </Head>
          <div className="flex">
            <GenerateSidebar />

            <ProfileNavbar />
          </div>

          <div className="mt-2 -ml-2">
            <GenerateImage />
          </div>
        </div>
      </>
    )
  );
};

export default Generate;

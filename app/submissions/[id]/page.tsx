'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import ProfileNavbar from '@/components/ProfileNavbar';
import Submission from '@/components/Submission';

const Submissions = () => {
  return (
    <>
      <div className="bg-black h-full">
        <div className="flex">
          <Sidebar />

          <ProfileNavbar />
        </div>

        <div className="mt-2">
          <Submission />
        </div>
      </div>
    </>
  );
};

export default Submissions;

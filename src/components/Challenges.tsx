import React, { useEffect, useState } from 'react';
import ChallengesHeader from './ChallengesHeader';
import ChallengesCard from './cards/ActiveChallengesCard';
import ChallengesTab from './tab/ChallengesTab';

const Challenges = () => {
  return (
    <div className="w-full pb-20">
      <ChallengesHeader />
      <div className="flex justify-center items-center mb-6  ml-[250px]">
        <ChallengesTab />
      </div>
    </div>
  );
};

export default Challenges;

import React from 'react';
import { BsSearch } from 'react-icons/bs';

const ChallengesHeader = () => {
  return (
    <div className="challenges-header-bg text-white text-start mb-6 py-10 h-[240px] ml-[250px] ">
      <h1 className="text-3xl py-1 pt-2 font-bold bg-transparent ml-10">
        Welcome To Challenges
      </h1>
      <p className="pb-6 pt-4 italic bg-transparent text-start  w-[60%] ml-10">
        Artemis's Challenges are our official friendly competitions. Use them as
        an opportunity to get better at AI image generation!
        <br />
        <br /> Each week a new theme is proposed, images are submitted, and
        votes casted.
        {/* <br /> Our goal is to challenge and push the creative boundaries of all
        the Artemis community! */}
      </p>
    </div>
  );
};

export default ChallengesHeader;

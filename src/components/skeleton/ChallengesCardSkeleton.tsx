// @ts-nocheck
import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const ChallengesCardSkeleton = () => {
  return (
    <div className="w-full text-gray-300">
      <div className="shadow p-5 rounded-lg border-t-4 border-b-4 border-r-[1px] border-l-[1px] border-purple-900 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 rex">
        <Skeleton
          height={150}
          width={280}
          className="w-[400px] rex"
          baseColor="#111"
          highlightColor="#A9A9A9"
        />

        <p className="mt-4 px-[50px]">
          <Skeleton
            height={30}
            className="mx-auto justify-center"
            baseColor="#111"
            highlightColor="#A9A9A9"
          />
        </p>

        <div className="mt-4">
          <Skeleton
            height={20}
            className="mx-auto"
            baseColor="#111"
            highlightColor="#A9A9A9"
          />
        </div>

        <div className="mt-4 px-[50px]">
          <Skeleton
            height={40}
            className="mx-auto"
            baseColor="#111"
            highlightColor="#A9A9A9"
          />
        </div>

        <div className="mt-4 px-[50px]">
          <Skeleton height={40} baseColor="#111" highlightColor="#A9A9A9" />
        </div>
      </div>
    </div>
  );
};

export default ChallengesCardSkeleton;

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SubmissionCardSkeleton = () => {
  return (
    <div className="w-[89%] mt-10 h-[300px] border-2 border-gray-500 rounded-r-[50px] mx-[75px]">
      <div className="flex gap-10">
        <Skeleton
          height={300}
          width={700}
          className="rounded-l-[80px]"
          baseColor="#111"
          highlightColor="#A9A9A9"
        />

        <div className="text-white w-full">
          <Skeleton
            height={25}
            className="mt-8"
            baseColor="#111"
            highlightColor="#A9A9A9"
          />

          <div className="mt-4">
            <Skeleton
              height={20}
              className="w-3/4"
              baseColor="#111"
              highlightColor="#A9A9A9"
            />
          </div>

          <div className="mt-3">
            <Skeleton
              height={20}
              className="w-1/2"
              baseColor="#111"
              highlightColor="#A9A9A9"
            />
          </div>

          <div className="mt-5">
            <Skeleton
              height={40}
              className="mx-auto w-1/2"
              baseColor="#111"
              highlightColor="#A9A9A9"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionCardSkeleton;

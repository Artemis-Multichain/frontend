'use client';

import React, { useEffect, useState } from 'react';
import PromptCard from './cards/PromptCard';
import ExploreTab from './tab/ExploreTab';
import HomeHeader from './HomeHeader';
import ExploreMasonry from './ExploreMasonry';
import RangeSlider from './RangeSlider';

const Explore = () => {
  return (
    <>
      <HomeHeader />

      <h1 className="text-white mt-5 ml-[240px] text-lg ">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mr-1 font-bold tracking-wide">
          Community
        </span>
        Created Prompts
      </h1>
      <div className="ml-[15px] flex items-center  mr-[40px] mt-[10px]">
        <ExploreTab />
        <div className="w-[400px] flex items-center text-white justify-end">
          {/* <span className="text-xl cursor-pointer">-</span> */}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <RangeSlider count="hidden" cfg="hidden" />
          {/* <span className="text-xl cursor-pointer">+</span> */}
        </div>
      </div>
      <ExploreMasonry />
    </>
  );
};

export default React.memo(Explore);

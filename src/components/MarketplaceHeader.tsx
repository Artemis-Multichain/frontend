import React from 'react';
import { BsSearch } from 'react-icons/bs';

const MarketplaceHeader = () => {
  return (
    <div className="marketplace-header-bg text-white text-center mb-6 py-10 h-[200px] ml-[200px] ">
      <h1 className="text-3xl py-3 pt-2 font-bold bg-transparent">Explore Premium Marketplace</h1>
      <p className="pb-4 pt-4 italic bg-transparent text-center w-[80%] ml-[100px]">
        Connect with like-minded individuals while exploring millions of AI art
        images created by models like Stable Diffusion, Midjourney, and more!
      </p>
    </div>
  );
};

export default MarketplaceHeader;

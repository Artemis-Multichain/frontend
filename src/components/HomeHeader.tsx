import React from 'react';
import { FaRegStarHalf } from 'react-icons/fa6';
import AICard from './cards/AICard';
import Link from 'next/link';

const HomeHeader = () => {
  return (
    <div className="ml-[235px]">
      <div className="flex items-center justify-between pr-14">
        <h1 className="text-xl text-white font-bold pt-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mr-1">
            Explore
          </span>
          AI Models
        </h1>

        <div>
          <Link href="/generate">
            <button className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow text-white px-4 rounded-[6px] text-sm py-1 flex items-center gap-[3px] mt-2">
              <FaRegStarHalf className="text-white" />
              Generate New Image
            </button>
          </Link>
        </div>
      </div>

      <div className="flex gap-5 mt-4 mr-6">
        <AICard image="/darkstable.jpg" model="Stable Diffusion XL" />
        <AICard image="/stable2.jpg" model="Dall-E &nbsp; 3" />
        <AICard image="/osis.jpg" model="Dreamshaper V7" />
        <AICard image="/cyber.jpg" model="Leonardo Diffusion" />
      </div>
    </div>
  );
};

export default HomeHeader;

// @ts-nocheck
import React from 'react';
import Image from 'next/image';

const AICard = ({ image, model }) => {
  return (
    <div className="">
      <div className="relative w-[280px] h-[140px]">
        <Image
          src={image}
          alt=""
          layout="fill"
          objectFit="cover"
          className="rex"
        />
        <div className="absolute inset-0 bg-black opacity-40" />
      </div>
      <p className="text-white bg- absolute top-[220px] ml-[20px] bg-black/50 p-2 rounded-xl font-bold">
        {model}
      </p>
    </div>
  );
};

export default AICard;

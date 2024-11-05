import React from 'react';

interface NftCardProps {
  name: string;
  image: string;
}

const NftCard: React.FC<NftCardProps> = ({ name, image }) => {
  return (
    <div className="flex">
      <div className="w-64 border-[1px] h-[300px] bg-transparent rounded-3xl  relative overflow-hidden shadow-lg transform transition-transform duration-300 hover:rotate-12">
        <div className="absolute top-0 left-0 w-full h-full  bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full  bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full  bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-3xl"></div>
        <div className="absolute top-0 left-0 w-full h-full  bg-opacity-10 backdrop-filter backdrop-blur-sm rounded-3xl"></div>
        <div className="relative z-10 text-white text-center">
          <img src={image} alt="" className="w-full h-[200px]" />
          <p className="text-md mt-3 text-gray-300">{name}</p>
          {/* <p className="text-md mt-3 text-gray-300">Collection name: TED</p> */}
        </div>
      </div>
    </div>
  );
};

export default NftCard;

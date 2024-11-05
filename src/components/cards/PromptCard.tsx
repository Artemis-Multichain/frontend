/* eslint-disable @next/next/no-img-element */
// @ts-nocheck
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ethers } from 'ethers';
import { formatAddress } from '@/utils/formatAddress';
import PromptPremiumDetails from '../modals/PromptPremiumDetails';
import Image from 'next/image';

const getRandomWord = () => {
  const words = ['Rare', 'Common'];
  const randomIndex = Math.floor(Math.random() * words.length);
  return words[randomIndex];
};

const PromptCard = ({ img, name, prompt, creator, price, cid }) => {
  const [openModal, setOpenModal] = useState(false);
  const [isPriceLoaded, setIsPriceLoaded] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <div className="border-gradient relative mb-10 flex justify-center items-center rounded-xl w-[224px]">
      <div className="w-[224px] p-2 h-full cursor-pointer overflow-hidden rounded-2xl flex flex-col items-center bg-black ">
        <div onClick={handleOpenModal}>
          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>

          <Image
            src={img}
            alt=""
            className=" object-cover rounded-[30px] transition-all duration-500 hover:opacity-90 pt-2"
            width={280}
            height={300}
          />
        </div>

        <div className="flex items-center justify-between gap-4 w-full">
          <div className="w-full">
            <div>
              <img
                src="https://s2.coinmarketcap.com/static/img/coins/200x200/21794.png"
                alt=""
                className="w-[34px] h-[35px] p-1 absolute top-4 right-3 bg-white/80 rounded-2xl"
              />
            </div>
            <div>
              {/* <img
                src="https://cryptologos.cc/logos/versions/ethereum-eth-logo-diamond-purple.svg?v=026"
                alt=""
                className="w-[34px] h-[35px] p-1 absolute top-4 right-3 bg-white/90 rounded-2xl mr-5 z-10"
              /> */}
            </div>

            <span className="text-gray-300 absolute top-4 left-2 bg-purple-700 p-1 px-2 text-[12px] rounded-full font-bold">
              Stable Diffusion Ultra
            </span>

            <h3 className="mt-1 text-[14px] text-center font-bold text-gray-300 w-full pt-2 border-2 p-2 rounded-lg border-purple-400">
              {name}
            </h3>
            <div className="flex items-center justify-between mt-1 text-gray-300">
              <div className="flex items-center justify-center w-full border-2 p-2 rounded-lg border-purple-400">
                <span className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                &nbsp;&nbsp;
                <div className="flex flex-col">
                  {creator && formatAddress(creator)}
                </div>
                &nbsp;&nbsp;
                <div className="flex flex-col"></div>
              </div>
            </div>

            <div className="flex justify-center text-gray-300 text-md gap-12 pt-2 ">
              <div className="flex flex-col w-full px-2 ">
                <p>Price:</p>
                <p className="flex items-center text-sm">
                  <span>{price} APT</span>
                </p>
              </div>
              <div className="flex flex-col">
                <p>Rarity:</p>
                <p>{getRandomWord()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <PromptPremiumDetails
        openMintModal={openModal}
        handleOnClose={() => setOpenModal(false)}
        image={img}
        name={name}
        price={price}
        prompt={prompt}
        creator={creator}
        cid={cid}
      />
    </div>
  );
};

export default PromptCard;

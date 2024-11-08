// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import PromptCard from './cards/PromptCard';
import MarketplaceTab from './tab/MarketplaceTab';
import MarketplaceHeader from './MarketplaceHeader';
import axios from 'axios';
import PromptCardSkeleton from './skeleton/PromptCardSkeleton';
import { useQuery } from '@tanstack/react-query';

interface Attribute {
  trait_type: string;
  value: string;
}

interface NFT {
  metadata_url: string;
  image_url?: string;
  name?: string;
  prompts?: string;
  identifier: string;
  attributes: Attribute[];
  promptPrice: number;
  maxSupply: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const MarketplaceC = () => {
  const fetchPremiumPrompts = async (): Promise<PremiumPrompt[]> => {
    const response = await axios.get(
      `${BASE_URL}/marketplace/get-premium-prompts/?page=1&page_size=20`
    );
    return response.data.prompts;
  };

  const {
    data: premiumPrompts,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['premiumPrompts'],
    queryFn: fetchPremiumPrompts,
  });

  console.log('premium prompts', premiumPrompts);

  return (
    <>
      <MarketplaceHeader />
      <div className="ml-[10px] flex items-center justify-between mr-[40px]">
        <MarketplaceTab />
        <div className="flex">
          <div className="text-gray-400 flex items-center">
            <p className="py-2 px-6 font-bold rounded-md text-sm bg-white/10">
              Chains:
            </p>
            &nbsp; &nbsp; &nbsp;
            <p className="font-bold flex items-center text-xs px-3 rounded-xl border border-gray-300 cursor-pointer">
              <img
                src="https://cryptologos.cc/logos/arbitrum-arb-logo.svg?v=035"
                alt=""
                className="w-[28px] h-[28px] p-1  rounded-2xl"
              />
              Arbitrum
            </p>
          </div>
          <div className="text-gray-400 flex items-center">
            &nbsp; &nbsp; &nbsp;
            <p className="font-bold flex items-center text-xs px-3 rounded-xl border border-gray-300 cursor-pointer">
              <img
                src="https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp"
                alt=""
                className="w-[28px] h-[28px] p-1  rounded-2xl"
              />
              Base
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 2xl:grid-cols-7 gap-3 mt-4 ml-[35px] mr-[6px] pl-[200px]">
        {isLoading
          ? Array.from({ length: 10 }).map((_, index) => (
              <PromptCardSkeleton key={index} />
            ))
          : premiumPrompts?.map((prompt, index) => (
              <PromptCard
                key={index}
                img={prompt.ipfs_image_url}
                name={prompt.collection_name}
                creator={prompt.account_address}
                price={prompt.prompt_nft_price}
                prompt={prompt.prompt}
                cid={prompt.cid}
                chainName={prompt.chain}
                ai_model={prompt.ai_model}
                maxSupply={prompt.max_supply}
              />
            ))}
      </div>
    </>
  );
};

export default React.memo(MarketplaceC);

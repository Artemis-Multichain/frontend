import React, { useState } from 'react';
import useIpfsData from '@/utils/useIpfsData';
import { formatAddress } from '@/utils/formatAddress';
import SubmissionFullscreenModal from '../modals/SubmissionFullscreenModal';
import type { SubmissionCardProps } from '../types';

const SubmissionCard: React.FC<SubmissionCardProps> = ({
  ipfsHash,
  voteCount,
  onVote,
  submitter,
  isVoting,
  chain,
  ipfsUri,
}) => {
  const ipfsData = useIpfsData(ipfsHash);
  console.log('ipfsData:', ipfsData);
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageUrl = (ipfsImageUrl: string | undefined) => {
    if (ipfsImageUrl) {
      return ipfsImageUrl.replace('ipfs://', 'https://nftstorage.link/ipfs/');
    }
    return '/placeholder.jpg';
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="w-[85%] mt-10 h-[300px] border-2 border-gray-500 rounded-[50px] mx-[20px]">
        <div className="flex gap-10">
          <img
            src={getImageUrl(ipfsData?.image)}
            alt=""
            className="h-[300px] w-[700px] object-cover rounded-l-[50px] cursor-pointer"
            onClick={handleImageClick}
          />
          <div className="text-white">
            <h1 className="text-xl mt-8 font-bold">{ipfsData?.name}</h1>
            <div className="flex items-center justify-start py-2 pl-2 border-[4px] border-[#292828] rounded-xl mt-4">
              <p className="font-bold">Creator :</p>
              &nbsp;&nbsp;
              <p className="flex items-center">
                <span className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full" />
                &nbsp;
                <span className="text-sm">
                  {submitter ? formatAddress(submitter) : '0x'}
                </span>
              </p>
            </div>
            <div className="text-white mt-3 border-2 border-purple-600 p-2 rounded-lg">
              <span className="font-bold text-gray-300">Total Votes:</span>
              &nbsp;&nbsp;&nbsp;&nbsp; {voteCount}
            </div>
            <div className="text-center">
              <button
                className="text-white border-purple-300 border focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-8 mt-5 py-2 hover:opacity-70"
                onClick={onVote}
                disabled={isVoting}
              >
                {isVoting ? 'Voting....' : 'Vote'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubmissionFullscreenModal
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        imageSrc={getImageUrl(ipfsData?.image)}
        description={ipfsData?.description}
      />
    </>
  );
};

export default SubmissionCard;
import React, { useState, useEffect } from 'react';
import PromptFreeDetails from '../modals/PromptFreeDetails';
import { GoLock } from 'react-icons/go';

const truncatePrompt = (prompt: string, maxLength = 200) => {
  if (prompt && prompt.length > maxLength) {
    return prompt.substring(0, maxLength) + '...';
  }
  return prompt;
};

interface FeedImageCardProps {
  index: number;
  imageUrl: string;
  name: string;
  prompt: string;
  promptId: number;
  promptType: string;
  account: string;
  isEncrypted: boolean;
}

const FeedImageCard: React.FC<FeedImageCardProps> = ({
  index,
  imageUrl,
  name,
  prompt,
  promptId,
  promptType,
  account,
  isEncrypted,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikeProcessing) return;

    setIsLikeProcessing(true);

    setTimeout(() => {
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

      setIsLiked(newLikedState);
      setLikesCount(newLikesCount);

      localStorage.setItem(`likes_${promptId}`, newLikesCount.toString());
      localStorage.setItem(`liked_${promptId}`, newLikedState.toString());

      setIsLikeProcessing(false);
    }, 500);
  };

  let height: string;
  switch (index % 4) {
    case 0:
      height = 'h-[400px]';
      break;
    case 1:
      height = 'h-[250px]';
      break;
    case 2:
      height = 'h-[420px]';
      break;
    case 3:
      height = 'h-[390px]';
      break;
    default:
      height = 'h-[600px]';
  }

  const truncatedPrompt = truncatePrompt(prompt);

  const optimizedImageUrl = imageUrl.replace('gateway.pinata.cloud', 'ipfs.io');

  return (
    <>
      <div
        className={`relative ${height} bg-cover bg-center m-1 rounded-lg group overflow-hidden cursor-pointer`}
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
        onClick={handleOpenModal}
      >
        {isEncrypted && (
          <div className="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
            <GoLock />
            Premium Prompt
          </div>
        )}
        <div className="overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute bottom-2 left-2 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-gray-300 text-sm">{truncatedPrompt}</span>
        </div>
      </div>

      <PromptFreeDetails
        openMintModal={openModal}
        handleOnClose={() => setOpenModal(false)}
        image={imageUrl}
        name={name}
        prompt={prompt}
        creator={account}
      />
    </>
  );
};

export default FeedImageCard;

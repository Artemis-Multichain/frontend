import React, { useState, useEffect } from 'react';
import PromptFreeDetails from '../modals/PromptFreeDetails';
import { FaHeart } from 'react-icons/fa6';
import { HiOutlineHeart } from 'react-icons/hi';

const truncatePrompt = (prompt: string, maxLength = 200) => {
  if (prompt && prompt.length > maxLength) {
    return prompt.substring(0, maxLength) + '...';
  }
  return prompt;
};

interface ImageCardProps {
  index: number;
  imageUrl: string;
  name: string;
  prompt: string;
  promptId: number;
  promptType: string;
  account: string;
}

const ImageCard: React.FC<ImageCardProps> = ({
  index,
  imageUrl,
  name,
  prompt,
  promptId,
  promptType,
  account,
}) => {
  const [openModal, setOpenModal] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  useEffect(() => {
    // Load likes from localStorage or assign random likes
    const storedLikes = localStorage.getItem(`likes_${promptId}`);
    if (storedLikes) {
      setLikesCount(parseInt(storedLikes));
      setIsLiked(localStorage.getItem(`liked_${promptId}`) === 'true');
    } else {
      const randomLikes = Math.floor(Math.random() * 5) + 1; // Random number between 1 and 5
      setLikesCount(randomLikes);
      localStorage.setItem(`likes_${promptId}`, randomLikes.toString());
    }
  }, [promptId]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLikeProcessing) return;

    setIsLikeProcessing(true);

    // Simulate API call delay
    setTimeout(() => {
      const newLikedState = !isLiked;
      const newLikesCount = newLikedState ? likesCount + 1 : likesCount - 1;

      setIsLiked(newLikedState);
      setLikesCount(newLikesCount);

      // Update localStorage
      localStorage.setItem(`likes_${promptId}`, newLikesCount.toString());
      localStorage.setItem(`liked_${promptId}`, newLikedState.toString());

      setIsLikeProcessing(false);
    }, 500); // 500ms delay to simulate API call
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
        <div className="overlay absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

        <div className="absolute bottom-2 left-2 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="text-gray-300 text-sm">{truncatedPrompt}</span>
        </div>

        <div
          className="like-button absolute top-2 right-2 rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer pointer-events-auto"
          onClick={handleLikeClick}
        >
          {isLiked ? (
            <FaHeart
              className={`w-8 h-8 text-red-500 ${
                isLikeProcessing ? 'opacity-50' : ''
              }`}
            />
          ) : (
            <HiOutlineHeart
              className={`w-8 h-8 text-white ${
                isLikeProcessing ? 'opacity-50' : ''
              }`}
            />
          )}
          <span className="ml-1 text-white">{likesCount}</span>
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

export default ImageCard;

/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import React, { Fragment, useState, useCallback, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FaRegCopy, FaWandMagicSparkles } from 'react-icons/fa6';
import { RiCloseCircleLine } from 'react-icons/ri';
import { FiDownload } from 'react-icons/fi';
import { MdOutlineShare } from 'react-icons/md';
import Link from 'next/link';
import axios from 'axios';
import FullscreenImageModal from './FullscreenImageModal';
import { formatAddress } from '@/utils/formatAddress';

const PromptFreeDetails = ({
  openMintModal,
  handleOnClose,
  image,
  name,
  prompt,
  creator,
}) => {
  const [buttonText, setButtonText] = useState('Copy Prompt');
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowProcessing, setIsFollowProcessing] = useState(false);
  const [displayFollowing, setDisplayFollowing] = useState(false);
  const account = '';

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const handleImageClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreenModalOpen(true);
  }, []);

  const handleFullscreenClose = useCallback(() => {
    setIsFullscreenModalOpen(false);
  }, []);

  const handleFreeModalClose = useCallback(() => {
    if (!isFullscreenModalOpen) {
      handleOnClose();
    }
  }, [isFullscreenModalOpen, handleOnClose]);

  const handleCopyClick = () => {
    setButtonText('Copied!');
    navigator.clipboard.writeText(prompt);

    setTimeout(() => {
      setButtonText('Copy Prompt');
    }, 3000);
  };

  const handleFollowClick = async () => {
    if (!account?.address || isFollowProcessing) return;

    if (isFollowing) {
      setDisplayFollowing(!displayFollowing);
    } else {
      setIsFollowProcessing(true);
      try {
        const response = await axios.post(
          `${baseUrl}/socialfeed/follow-creator/`,
          null,
          {
            params: {
              follower_account: account.address,
              creator_account: creator,
            },
          }
        );

        if (response.status === 200) {
          setIsFollowing(true);
          setDisplayFollowing(true);
        }
      } catch (error) {
        console.error('Error following creator:', error);
      } finally {
        setIsFollowProcessing(false);
      }
    }
  };

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!account?.address || !creator) return;

      try {
        const response = await axios.get(
          `${baseUrl}/socialfeed/user-following/`,
          {
            params: {
              follower_account: account.address,
            },
          }
        );

        const followingList = response.data.following_with_top_prompts || [];
        const isCurrentlyFollowing = followingList.some(
          (item) => item.creator_account === creator
        );
        setIsFollowing(isCurrentlyFollowing);
        setDisplayFollowing(isCurrentlyFollowing);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [account?.address, creator, baseUrl]);

  return (
    <>
      <Transition appear show={openMintModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 font-serif"
          onClose={handleFreeModalClose}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur"
              aria-hidden="true"
            />

            <div className="flex min-h-full items-center justify-center p-2 text-center pt-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[899px] transform overflow-hidden rounded-lg py-3 bg-[#1a1919c5] border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-4 flex w-full text-center justify-center">
                    <div className="w-[100%]">
                      <img
                        src={image}
                        alt=""
                        className="rounded-xl w-[1024px] h-[800px] object-cover cursor-pointer"
                        onClick={handleImageClick}
                      />
                      <div className="pt-2 text-start text-white">
                        <div className="pt-1 ml-[10px] w-[100%] text-sm flex justify-center gap-3">
                          <span className="p-2 mb-2 border-[4px] rounded-lg border-[#292828] w-[40%] flex items-center justify-center gap-1 cursor-pointer">
                            <FiDownload className="text-lg" />
                            Download
                          </span>
                          <span className="p-2 mb-2 border-[4px] rounded-lg border-[#292828] w-[40%] flex items-center gap-1 cursor-pointer justify-center">
                            <MdOutlineShare className="text-lg" />
                            Share
                          </span>
                        </div>
                      </div>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div className="text-white w-[100%]">
                      <div className="text-start border-b-[1px] mt-1 border-[#292828]">
                        <h1 className="pb-4 text-xl ml-3">{name}</h1>
                      </div>

                      <div>
                        <RiCloseCircleLine
                          className="text-[37px] absolute right-6 top-7 text-[#555353] cursor-pointer"
                          onClick={handleOnClose}
                        />
                      </div>

                      <div className="flex items-center justify-start py-2 pl-4 border-[4px] border-[#292828] rounded-xl ml-[10px]">
                        <p className="font-bold">Creator :</p>
                        &nbsp;&nbsp;
                        <p className="flex items-center">
                          <span className="p-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full mr-2" />
                          <span>
                            {creator ? formatAddress(creator) : 'user'}
                          </span>
                        </p>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span
                          className={`border ${
                            displayFollowing
                              ? 'bg-gray-700 text-white'
                              : 'border-gray-200 text-gray-200'
                          } p-[2px] rounded-full text-xs px-3 cursor-pointer hover:opacity-80 ${
                            isFollowProcessing
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                          onClick={handleFollowClick}
                        >
                          {displayFollowing ? 'Following' : 'Follow'}
                        </span>
                      </div>

                      <div className="pt-4 text-start">
                        <h4 className="pl-4 text-sm font-bold">
                          Prompt Details
                        </h4>
                        <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300">
                          {prompt}
                        </p>

                        <div className="pt-2 ml-[10px] w-[100%] text-sm flex justify-center gap-3 border-[10px] border-[#292828] ">
                          <button
                            className="p-2 mb-2 border-[6px] rounded-lg border-[#292828] w-[40%] flex items-center justify-center gap-1"
                            onClick={handleCopyClick}
                          >
                            <FaRegCopy className="text-lg" />
                            {buttonText}
                          </button>
                          <button className="p-2 mb-2 border-[6px] rounded-lg border-[#292828] w-[40%] flex items-center gap-1 justify-center">
                            <Link
                              href="/generate"
                              className="flex items-center"
                            >
                              <FaWandMagicSparkles className="text-lg" />
                              Remix
                            </Link>
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 text-start">
                        <h4 className="pl-4 text-sm font-bold">
                          Negative Prompts
                        </h4>
                        <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300 ">
                          cartoon, 2d, sketch, drawing, anime, open mouth,
                          nudity, naked, nsfw, helmet, head gear, close up,
                          blurry eyes, two heads, two faces, plastic, Deformed,
                          blurry, bad anatomy, bad eyes, crossed eyes,
                          disfigured, poorly drawn face, mutation, mutated,
                          extra limb, ugly, poorly drawn hands, missing limb,
                          blurry, floating limbs, disconnected limbs, malformed
                          hands, blur, out of focus, long neck, long body,
                          mutated hands and fingers, out of frame, blender,
                          doll, cropped, low-res
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Input Resolution
                          </h1>
                          <p className="text-[14px] font-bold">1080x1080</p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            AI Model
                          </h1>
                          <p className="text-[14px] font-bold">
                            Stable Diffusion XL
                          </p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Chain
                          </h1>
                          <p className="text-[14px] font-bold">Base Sepolia</p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Preset
                          </h1>
                          <p className="text-[14px] font-bold">digital-art</p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Current Supply
                          </h1>
                          <p className="text-[14px] font-bold">3000</p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Clip Preset
                          </h1>
                          <p className="text-[14px] font-bold">FAST_BLUE</p>
                        </div>
                      </div>
                    </div>
                    &nbsp;&nbsp;
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {isFullscreenModalOpen && (
        <FullscreenImageModal
          isOpen={isFullscreenModalOpen}
          handleClose={handleFullscreenClose}
          imageSrc={image}
        />
      )}
    </>
  );
};

export default PromptFreeDetails;

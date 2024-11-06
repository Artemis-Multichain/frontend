// @ts-nocheck\
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect, useCallback } from 'react';
import { FaRegCopy, FaWandMagicSparkles } from 'react-icons/fa6';
import { RiCloseCircleLine } from 'react-icons/ri';
import { FiDownload } from 'react-icons/fi';
import { MdOutlineShare, MdOutlineLock } from 'react-icons/md';
import PromptSkeleton from '../skeleton/PromptSkeleton';
import { config } from '@/abi';
import AIPromptMarketplace from '@/abi/AIPromptMarketplace.json';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { decryptPrompt } from '@/utils/encryptPrompt';
import generateKey from '@/utils/generateKey';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';
// import { checkTokenAccess } from '@/utils/checkTokenAccess';
import { ethers, type Eip1193Provider } from 'ethers';
import { useSmartAccount, useAccount } from '@particle-network/connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { formatAddress } from '@/utils/formatAddress';
import { findNFTIdentifierByCID } from '@/utils/getTokenId';
import FullscreenImageModal from './FullscreenImageModal';

interface PromptPremiumDetailsProps {
  openMintModal: boolean;
  handleOnClose: () => void;
  image: string;
  name: string;
  price: string;
  prompt: string;
  creator: string;
  cid: string;
}

const PromptPremiumDetails = ({
  openMintModal,
  handleOnClose,
  image,
  name,
  // tokenId,
  price,
  // tokenPrice,
  prompt,
  creator,
  cid,
}: PromptPremiumDetailsProps) => {
  const smartAccount = useSmartAccount();
  const [hasAccess, setHasAccess] = useState(false);
  const [decryptedResponse, setDecryptedResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [buttonText, setButtonText] = useState('Copy Prompt');
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);
  const { address } = useAccount();
  const [txHash, setTxHash] = useState('');
  const [tokenId, setTokenId] = useState<string | null>(null);

  interface ImageClickEvent {
    preventDefault: () => void;
    stopPropagation: () => void;
  }

  const handleImageClick = useCallback((e: ImageClickEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsFullscreenModalOpen(true);
  }, []);

  const handleFullscreenClose = useCallback(() => {
    setIsFullscreenModalOpen(false);
  }, []);

  const handlePremiumModalClose = useCallback(() => {
    if (!isFullscreenModalOpen) {
      handleOnClose();
    }
  }, [isFullscreenModalOpen, handleOnClose]);

  useEffect(() => {
    if (openMintModal && cid) {
      const getTokenId = async () => {
        try {
          let identifier = await findNFTIdentifierByCID(cid, 'base_sepolia');

          setTokenId(identifier);
        } catch (error) {
          console.error('Error fetching token ID:', error);
          toast.error('Failed to fetch token ID');
        }
      };

      getTokenId();
    }
  }, [openMintModal, cid]);

  // const defaultBalance = useFetchBalance(selectedAccount);
  // console.log('Default Balance:', defaultBalance);

  const handleCopyClick = () => {
    setButtonText('Copied!');
    navigator.clipboard.writeText(prompt);

    setTimeout(() => {
      setButtonText('Copy Prompt');
    }, 3000);
  };

  const handleAccessRequest = async () => {
    setIsLoading(true);

    try {
      // const accessResponse = await checkTokenAccess(tokenId, address);
      const accessResponse = 'Has Access';

      if (accessResponse === 'No Access') {
        const decryptionKey = generateKey(name);
        const decryptedPrompt = decryptPrompt(prompt, decryptionKey);
        setDecryptedResponse(decryptedPrompt);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error checking token access:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMint = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    const mintNotification = toast.loading('Please wait! Minting a Prompt NFT');

    try {
      if (!tokenId) {
        throw new Error('Token ID not available');
      }

      if (!smartAccount) {
        throw new Error('Please connect your wallet');
      }

      const customProvider = new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.UserPaidNative
        ) as Eip1193Provider,
        'any'
      );

      if (!customProvider) {
        throw new Error('Failed to initialize provider');
      }

      const signer = await customProvider.getSigner();

      // Initialize contract
      const mintPromptContract = new ethers.Contract(
        config.AIPromptMarketplace,
        AIPromptMarketplace,
        signer
      );

      // Get token data
      const tokenData = await mintPromptContract.getTokenData(tokenId);
      console.log('\nToken Details:', {
        tokenId,
        creator: tokenData.creator,
        supply: Number(tokenData.supply),
        priceUSD: Number(tokenData.priceUSD) / 1_000_000,
        royaltyPercentage: Number(tokenData.royaltyPercentage),
      });

      // Get ETH price and validate
      const ethPrice = await mintPromptContract.getEthPrice();
      if (ethPrice.toString() === '0') {
        throw new Error('No valid ETH price available');
      }
      console.log('Current ETH Price:', Number(ethPrice) / 1_000_000, 'USD');

      // Get the required ETH amount
      const requiredETH = await mintPromptContract.getCurrentPriceETH(tokenId);
      if (requiredETH.toString() === '0') {
        throw new Error('Invalid price calculation');
      }
      console.log(
        'Required Base Payment:',
        ethers.formatEther(requiredETH),
        'ETH'
      );

      // Calculate fees
      const platformFee = await mintPromptContract.platformFee();
      const platformFeeAmount =
        (requiredETH * BigInt(platformFee)) / BigInt(10000);
      const royaltyAmount =
        (requiredETH * BigInt(tokenData.royaltyPercentage)) / BigInt(10000);

      console.log('\nFee Breakdown:', {
        platformFee: ethers.formatEther(platformFeeAmount),
        royalty: ethers.formatEther(royaltyAmount),
        toCreator: ethers.formatEther(
          requiredETH - platformFeeAmount - royaltyAmount
        ),
      });

      // Verify user has sufficient balance
      const userAddress = await signer.getAddress();
      const balance = await customProvider.getBalance(userAddress);

      // Include estimated gas in balance check
      const gasEstimate = await mintPromptContract.mint.estimateGas(tokenId, {
        value: requiredETH,
      });
      const gasBuffer = (gasEstimate * BigInt(120)) / BigInt(100); // 20% buffer
      const feeData = await customProvider.getFeeData();
      const gasPrice = feeData.gasPrice ?? ethers.parseUnits('10', 'gwei');
      const maxGasCost = gasBuffer * gasPrice;

      const totalRequired = requiredETH + maxGasCost;

      if (balance < totalRequired) {
        throw new Error(
          `Insufficient balance. Need ${ethers.formatEther(
            totalRequired
          )} ETH (including max gas)`
        );
      }

      console.log('\nMinting NFT...', {
        tokenId,
        value: ethers.formatEther(requiredETH),
        estimatedGas: gasBuffer.toString(),
        maxGasCost: ethers.formatEther(maxGasCost),
      });

      // Execute mint transaction
      const tx = await mintPromptContract.mint(tokenId, {
        value: requiredETH,
        gasLimit: gasBuffer,
      });

      console.log('Transaction sent:', tx.hash);
      setTxHash(tx.hash);

      toast.update(mintNotification, {
        render: 'Transaction submitted, waiting for confirmation...',
        type: 'info',
        isLoading: true,
      });

      const receipt = await tx.wait();

      // Parse mint event
      const mintEvent = receipt.logs
        .map((log: any) => {
          try {
            return mintPromptContract.interface.parseLog({
              topics: [...log.topics],
              data: log.data,
            });
          } catch {
            return null;
          }
        })
        .find((event: any) => event?.name === 'TokenMinted');

      if (mintEvent && 'args' in mintEvent) {
        console.log('\nNFT minted successfully!', {
          tokenId: Number(mintEvent.args.tokenId),
          buyer: mintEvent.args.buyer,
          creator: mintEvent.args.creator,
          pricePaid: ethers.formatEther(mintEvent.args.priceETH),
          platformFee: ethers.formatEther(mintEvent.args.platformFeeAmount),
          royalty: ethers.formatEther(mintEvent.args.royaltyAmount),
        });

        toast.update(mintNotification, {
          render: 'Successfully minted NFT Prompt! 🎉',
          type: 'success',
          isLoading: false,
          autoClose: 7000,
        });

        setHasAccess(true);
      }
    } catch (error: any) {
      console.error('Mint failed:', error);

      let errorMessage = 'Failed to mint NFT';

      if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient balance for gas fee and NFT price';
      } else if (error.message.includes('InsufficientSupply')) {
        errorMessage = 'This NFT is sold out!';
      } else if (error.message.includes('InvalidPrice')) {
        errorMessage = 'No valid price available. Please wait and try again.';
      } else if (error.message.includes('InvalidPayment')) {
        errorMessage = 'Incorrect payment amount for minting';
      } else if (error.message.includes('user rejected transaction')) {
        errorMessage = 'Transaction was rejected';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.update(mintNotification, {
        render: `Error: ${errorMessage}`,
        type: 'error',
        isLoading: false,
        autoClose: 7000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (openMintModal) {
      handleAccessRequest();
    }
  }, [openMintModal]);

  return (
    <>
      <Transition appear show={openMintModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative font-serif"
          style={{ zIndex: isFullscreenModalOpen ? 40 : 50 }}
          onClose={handlePremiumModalClose}
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

            <div className="flex min-h-full  items-center justify-center p-2 text-center pt-12">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[899px]  transform overflow-hidden rounded-lg py-3 bg-[#1a1919c5] border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-4 flex w-full text-center justify-center">
                    <div className="w-[100%]">
                      <img
                        src={image}
                        alt=""
                        className="rounded-xl w-[1024px] h-[800px]  object-cover cursor-pointer"
                        onClick={handleImageClick}
                      />
                      <div className="pt-2 text-start text-white">
                        <div className="pt-1 ml-[10px] w-[100%] text-sm flex justify-center gap-3  ">
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
                          <img
                            src="/fight.webp"
                            alt=""
                            className="w-[30px] h-[30px] rounded-full object-cover mr-1"
                          />
                          {creator ? formatAddress(creator) : 'user'}
                        </p>
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <span className="bg-purple-500 p-[2px] rounded-full text-[16px]  px-3 cursor-pointer hover:opacity-80">
                          Follow
                        </span>
                      </div>

                      <div className="pt-4 text-start">
                        <h4 className="pl-4 text-sm font-bold">
                          Prompt Details
                        </h4>
                        {isLoading ? (
                          <PromptSkeleton />
                        ) : hasAccess ? (
                          <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300">
                            {decryptedResponse}
                          </p>
                        ) : (
                          <div className="relative">
                            <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300 blur-[4px]">
                              Lorem ipsum dolor sit amet, consectetur
                              adipisicing elit. Distinctio, atque adipisci minus
                              eos sint ratione qui laudantium maxime cum fugiat
                              velit itaque facilis quia nobis asperiores ipsam
                              quibusdam eius perspiciatis repellat quam suscipit
                              pariatur. Veritatis rem nisi fuga optio
                              doloremque!
                            </p>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <span className="text-gray-300 text-md bg-black bg-opacity-70 p-3 rounded-md flex flex-col justify-center items-center">
                                <MdOutlineLock className="text-lg mb-2" />
                                Buy Prompt NFT to get access
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="pt-2 ml-[10px] w-[100%] text-sm flex justify-center gap-3 border-[10px] border-[#292828] ">
                          <button
                            disabled={!hasAccess}
                            className={`p-2 mb-2 border-[6px] rounded-lg border-[#292828] w-[40%] flex items-center justify-center gap-1 ${
                              !hasAccess
                                ? 'text-stone-500 cursor-not-allowed'
                                : ''
                            }`}
                            onClick={handleCopyClick}
                          >
                            <FaRegCopy className="text-lg" />
                            {buttonText}
                          </button>
                          <button
                            disabled={!hasAccess}
                            className={`p-2 mb-2 border-[6px] rounded-lg border-[#292828] w-[40%] flex items-center gap-1 justify-center ${
                              !hasAccess
                                ? 'text-stone-500 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <Link
                              href="/generate"
                              className={`flex items-center ${
                                !hasAccess
                                  ? 'text-stone-500 cursor-not-allowed'
                                  : ''
                              }`}
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
                        {hasAccess && (
                          <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300 ">
                            cartoon, 2d, sketch, drawing, anime, open mouth,
                            nudity, naked, nsfw, helmet, head gear, close up,
                            blurry eyes, two heads, two faces, plastic,
                            Deformed, blurry, bad anatomy, bad eyes, crossed
                            eyes, disfigured, poorly drawn face, mutation,
                            mutated, extra limb, ugly, poorly drawn hands,
                            missing limb, blurry, floating limbs, disconnected
                            limbs, malformed hands, blur, out of focus, long
                            neck, long body, mutated hands and fingers, out of
                            frame, blender, doll, cropped, low-res
                          </p>
                        )}

                        {!hasAccess && (
                          <div className="relative">
                            <p className="ml-[10px] w-full mt-2 text-sm p-2 rounded-md border-[10px] border-[#292828] text-gray-300 blur-[4px]">
                              Lorem ipsum dolor sit amet consectetur adipisicing
                              elit. Eligendi natus totam eius illum qui sapiente
                              ratione a, maxime optio magnam vitae, saepe
                              quaerat consectetur obcaecati quibusdam hic odio.
                              Voluptatibus molestias perferendis iste atque vero
                              quis impedit sint pariatur nobis quasi, aliquid
                              suscipit esse cupiditate. Totam aut velit
                              temporibus porro inventore odio in, placeat eius
                              ad consequuntur illum maiores commodi officia!
                            </p>
                            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                              <span className="text-gray-300 text-md bg-black bg-opacity-70 p-3 rounded-md flex flex-col justify-center items-center">
                                <MdOutlineLock className="text-lg mb-2" />
                                Buy Prompt NFT to get access
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Input Resolution
                          </h1>
                          <p className="text-[14px] font-bold">1024x1024</p>
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
                          <p className="text-[14px] font-bold">
                            Shardeum Testnet
                          </p>
                        </div>
                        <div>
                          <h1 className="text-[12px] text-gray-400 text-bold">
                            Preset
                          </h1>
                          <p className="text-[14px] font-bold">neon-punk</p>
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

                      <div className="pt-8 text-start">
                        <div className="pt-2 ml-[10px] w-[100%] text-sm flex justify-center gap-3 border-[10px] border-[#292828] pb-2">
                          {isGenerating ? (
                            <span className="text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[80%] font-bold px-32 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-lg sm:w-auto py-4 text-center text-lg cursor-pointer hover:opacity-50">
                              <ClipLoader
                                color="#f0f0f0"
                                size={30}
                              />
                            </span>
                          ) : hasAccess ? (
                            <span className="text-white bg-gradient-to-r from-green-500 to-green-700 w-[80%] font-bold px-24 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 rounded-lg sm:w-auto py-4 text-center text-lg">
                              Prompt Bought
                            </span>
                          ) : (
                            <span
                              className="text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-[80%] font-bold px-24 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-lg sm:w-auto py-4 text-center text-lg cursor-pointer hover:opacity-50"
                              onClick={handleMint}
                            >
                              Buy for {price} USD
                            </span>
                          )}
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
      <ToastContainer />
    </>
  );
};

export default PromptPremiumDetails;

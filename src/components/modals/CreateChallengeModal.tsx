/* eslint-disable @next/next/no-html-link-for-pages */
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import hoursToSeconds from '@/utils/hoursToSeconds';
import { useQueryClient } from '@tanstack/react-query';
import { getChainConfig } from '@/abi';
import { ethers, parseEther, type Eip1193Provider } from 'ethers';
import ArtemisChallengesV2 from '@/abi/ArtemisChallengesV2.json';
import { useSmartAccount, useAccount } from '@particle-network/connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';

interface CreateChallengeModalProps {
  openMintModal: boolean;
  handleOnClose: () => void;
}

interface Metadata {
  name: string;
  description: string;
  image: string;
  prize: string;
  duration: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface PinataResponse {
  data: {
    IpfsHash: string;
  };
}

interface CreateChallengeResponse {
  txHash: string;
}

const CreateChallengeModal = ({
  openMintModal,
  handleOnClose,
}: CreateChallengeModalProps) => {
  const queryClient = useQueryClient();
  const smartAccount = useSmartAccount();
  const { address, chain } = useAccount();
  const account = '';
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [challengeName, setChallengeName] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengeDuration, setChallengeDuration] = useState('');
  const [challengePrize, setChallengePrize] = useState('');
  const [selectedImage, setSelectedImage] = useState('/placeholder.jpg');
  const [isCreating, setIsCreating] = useState(false);
  const [txHash, setTxHash] = useState('');

  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
  const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  interface ImageChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget & { files: FileList | null };
  }

  const handleImageChange = (e: ImageChangeEvent) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!smartAccount) {
      throw new Error('Please connect your wallet');
    }

    if (!chain?.id) {
      throw new Error('Chain ID is not defined');
    }
    const chainConfig = getChainConfig(chain.id);

    setIsCreating(true);

    try {
      if (
        !challengeName ||
        !challengeDuration ||
        !challengePrize ||
        !imageFile
      ) {
        throw new Error('Please fill in all required fields');
      }

      toast.info('Uploading challenge content to IPFS...', {
        autoClose: false,
        toastId: 'uploading-ipfs',
      });

      const formData = new FormData();
      formData.append('file', imageFile);
      const imagePinataResponse: PinataResponse = await axios.post(
        pinataEndpoint,
        formData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${
              (formData as any)._boundary
            }`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      if (!imagePinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload image to Pinata');
      }

      const imageUrl = `ipfs://${imagePinataResponse.data.IpfsHash}`;

      const metadata: Metadata = {
        name: challengeName,
        description: challengeDescription,
        image: imageUrl,
        prize: `${challengePrize} USDC`,
        duration: challengeDuration,
        external_url: '',
        attributes: [
          {
            trait_type: 'Duration',
            value: `${challengeDuration} hours`,
          },
          {
            trait_type: 'Prize',
            value: `${challengePrize} USDC`,
          },
          {
            trait_type: 'Status',
            value: 'Active',
          },
        ],
      };

      const jsonBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      const metadataFormData = new FormData();
      metadataFormData.append('file', jsonBlob);

      const metadataPinataResponse: PinataResponse = await axios.post(
        pinataEndpoint,
        metadataFormData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${
              (metadataFormData as any)._boundary
            }`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      if (!metadataPinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload metadata to Pinata');
      }

      const ipfsUrl = `ipfs://${metadataPinataResponse.data.IpfsHash}`;

      toast.dismiss('uploading-ipfs');
      toast.info('Creating challenge on-chain...', {
        autoClose: false,
        toastId: 'creating-challenge',
      });

      const customProvider = new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.UserPaidNative
        ) as Eip1193Provider,
        'any'
      );

      const signer = await customProvider.getSigner();

      if (!customProvider) {
        throw new Error('Failed to initialize provider');
      }

      const usdcAddress = chainConfig.usdcAddress;
      const usdcContract = new ethers.Contract(
        usdcAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );

      const prizeAmount = BigInt(Number(challengePrize) * 1_000_000);

      toast.info('Approving USDC spend...', {
        autoClose: false,
        toastId: 'approving-usdc',
      });

      const approveTx = await usdcContract.approve(
        chainConfig.artemisChallengesV2Address,
        prizeAmount
      );
      await approveTx.wait();

      toast.dismiss('approving-usdc');

      const contract = new ethers.Contract(
        chainConfig.artemisChallengesV2Address,
        ArtemisChallengesV2,
        signer
      );

      console.log("chainConfig.artemisChallengesV2Address", chainConfig.artemisChallengesV2Address);
      

      const durationInSeconds = Number(challengeDuration) * 3600;

      const tx = await contract.createChallengeWithUSDC(
        ipfsUrl,
        durationInSeconds,
        prizeAmount,
        {
          gasLimit: 500000,
        }
      );

      const receipt = await tx.wait();

      toast.dismiss('creating-challenge');
      toast.success('Challenge created successfully!', {
        autoClose: 5000,
      });

      queryClient.invalidateQueries(['activeChallenges']);

      setTxHash(receipt.hash);

      setChallengeName('');
      setChallengeDescription('');
      setChallengeDuration('');
      setChallengePrize('');
      setSelectedImage('/placeholder.jpg');
      setImageFile(null);

      handleOnClose();
    } catch (error: any) {
      console.error('Error in challenge creation process:', error);
      toast.dismiss('uploading-ipfs');
      toast.dismiss('creating-challenge');
      toast.dismiss('approving-usdc');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <Transition appear show={openMintModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 font-serif"
          onClose={handleOnClose}
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

            <div className="flex min-h-full  items-center justify-center p-2 text-center pt-6">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-[70%]  transform overflow-hidden rounded-lg py-3 bg-[#00000091] border border-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <div className="mt-4 flex w-full text-center justify-center">
                    <div className="w-[100%]">
                      <img
                        src={selectedImage}
                        alt=""
                        className="rounded-xl w-[1024px] h-[400px] object-cover"
                      />
                      <div className="pt-2 text-start text-white">
                        <input
                          type="file"
                          id="imageInput"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="mt-2 text-sm file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-purple-700
          hover:file:bg-violet-100"
                        />
                      </div>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <div className="text-white w-[100%]">
                      <form
                        className="ml-[40px] w-[400px] mt-6"
                        onSubmit={handleCreateChallenge}
                      >
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            name="floating"
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-purple-600 peer"
                            placeholder=" "
                            required
                            onChange={(e) => setChallengeName(e.target.value)}
                          />
                          <label
                            htmlFor="floating"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Challenge Name
                          </label>
                        </div>
                        <div className="relative z-0 w-full mb-6 group">
                          <textarea
                            name="text"
                            id="floating_text"
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-purple-600 peer"
                            placeholder=" "
                            required
                            onChange={(e) =>
                              setChallengeDescription(e.target.value)
                            }
                          />
                          <label
                            htmlFor="floating_repeat"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Prompt NFT Description (Optional)
                          </label>
                        </div>

                        <div className="text-gray-400 flex flex-col items-center mt-6">
                          <label htmlFor="quantity" className="block mb-1">
                            Challenge Duration (in hours):
                          </label>

                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            className="px-4 w-[60%] bg-transparent py-2 border border-gray-500 rounded-md focus:outline-none focus:ring focus:border-purple-600"
                            value={challengeDuration}
                            onChange={(e) =>
                              setChallengeDuration(e.target.value)
                            }
                          />
                        </div>

                        <div className="text-gray-400 mt-6 flex flex-col items-center">
                          <label htmlFor="quantity" className="block mb-1">
                            Challenge Prize (APT):
                          </label>
                          <input
                            type="number"
                            id="quantity"
                            name="quantity"
                            value={challengePrize}
                            className="px-6 bg-transparent py-2 border border-gray-500 rounded-md focus:outline-none focus:ring focus:border-purple-500"
                            onChange={(e) => setChallengePrize(e.target.value)}
                            required
                          />
                        </div>

                        {isCreating ? (
                          <button className="text-white  bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 mt-3 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300  rounded-lg text-sm font-bold w-[140px] sm:w-auto px-[72px] py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800">
                            <ClipLoader color="#f0f0f0" size={30} />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="text-white  bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 mt-3 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300  rounded-lg text-sm font-bold w-[140px] sm:w-auto px-8 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                          >
                            Create Challenge
                          </button>
                        )}
                      </form>
                    </div>
                    &nbsp;&nbsp;
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <ToastContainer />
    </>
  );
};

export default CreateChallengeModal;

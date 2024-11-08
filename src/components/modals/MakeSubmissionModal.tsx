// @ts-nocheck

'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import base64ToBlob from '@/utils/base64toBlob';
import axios from 'axios';
import useStableDiffusion from '@/services/useStableDiffusion';
import { useQueryClient } from '@tanstack/react-query';
import { useAccount, useSmartAccount } from '@particle-network/connectkit';
import { AAWrapProvider, SendTransactionMode } from '@particle-network/aa';
import { ethers, type Eip1193Provider } from 'ethers';
import { useParams } from 'next/navigation';

const ABI = [
  {
    name: 'submitSolution',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'challengeId', type: 'uint256' },
      { name: 'ipfsHash', type: 'string' },
    ],
    outputs: [],
  },
] as const;

interface MakeSubmissionModalProps {
  openModal: boolean;
  handleOnClose: () => void;
}

const MakeSubmissionModal: React.FC<MakeSubmissionModalProps> = ({
  openModal,
  handleOnClose,
}) => {
  const params = useParams();
  const challengeId = params.id as string;

  const queryClient = useQueryClient();
  const { isConnected, chain } = useAccount();
  const smartAccount = useSmartAccount();

  const [submissionName, setSubmissionName] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [base64Image, setBase64Image] = useState<string | null>(null);

  const pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const pinataSecretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;
  const pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';

  const CHALLENGES_ADDRESS = process.env.NEXT_PUBLIC_ARTEMIS_CHALLENGES_ADDRESS;

  const customProvider = smartAccount
    ? new ethers.BrowserProvider(
        new AAWrapProvider(
          smartAccount,
          SendTransactionMode.UserPaidNative
        ) as Eip1193Provider,
        'any'
      )
    : null;

  const handleGenerateImages = async (e: React.FormEvent) => {
    e.preventDefault();

    const mintNotification = toast.loading(
      'Generating your Images! Standby...'
    );

    setIsGenerating(true);

    try {
      const data = await useStableDiffusion(submissionDescription, 1);

      if (data && data.artifacts && data.artifacts.length > 0) {
        setBase64Image(data.artifacts[0].base64);

        toast.update(mintNotification, {
          render: 'Image Generation Completed',
          type: 'success',
          isLoading: false,
          autoClose: 7000,
        });
      } else {
        throw new Error('No image data returned');
      }
    } catch (error) {
      console.error('Error generating images:', error);
      toast.update(mintNotification, {
        render: `Error: ${
          error instanceof Error ? error.message : 'Failed to generate image'
        }`,
        type: 'error',
        isLoading: false,
        autoClose: 7000,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const submitEntry = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!smartAccount || !customProvider) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!base64Image) {
      toast.error('Please generate an image first');
      return;
    }

    const submissionNotification = toast.loading('Submitting your entry...');
    setIsSubmitting(true);

    try {
      // Upload image to Pinata
      const imageBlob = base64ToBlob(base64Image, 'image/jpeg');
      const formData = new FormData();
      formData.append('file', imageBlob);

      const imagePinataResponse = await axios.post(pinataEndpoint, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${
            (formData as any)._boundary
          }`,
          pinata_api_key: pinataApiKey!,
          pinata_secret_api_key: pinataSecretApiKey!,
        },
      });

      if (!imagePinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload image to Pinata');
      }

      // Create and upload metadata
      const metadata = {
        name: submissionName,
        description: submissionDescription,
        image: `https://gateway.pinata.cloud/ipfs/${imagePinataResponse.data.IpfsHash}`,
      };

      const jsonBlob = new Blob([JSON.stringify(metadata)], {
        type: 'application/json',
      });
      formData.set('file', jsonBlob);

      const metadataPinataResponse = await axios.post(
        pinataEndpoint,
        formData,
        {
          headers: {
            'Content-Type': `multipart/form-data; boundary=${
              (formData as any)._boundary
            }`,
            pinata_api_key: pinataApiKey!,
            pinata_secret_api_key: pinataSecretApiKey!,
          },
        }
      );

      if (!metadataPinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload metadata to Pinata');
      }

      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataPinataResponse.data.IpfsHash}`;

      // Submit to blockchain
      const signer = await customProvider.getSigner();

      const challengesContract = new ethers.Contract(
        CHALLENGES_ADDRESS,
        ABI,
        signer
      );

      // Prepare transaction
      const tx = await challengesContract.submitSolution.populateTransaction(
        challengeId,
        metadataUrl
      );

      // Send transaction using Particle AA SDK
      const txResponse = await signer.sendTransaction(tx);
      const receipt = await txResponse.wait();

      console.log('Transaction hash:', receipt?.hash);

      // Update UI and state
      toast.update(submissionNotification, {
        render: 'Submission successful! 🎉',
        type: 'success',
        isLoading: false,
        autoClose: 5000,
      });

      // Reset form
      setSubmissionName('');
      setSubmissionDescription('');
      setBase64Image(null);

      // Invalidate queries to refresh submission list
      queryClient.invalidateQueries(['submissions', challengeId]);

      // Close modal
      handleOnClose();
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.update(submissionNotification, {
        render: `Error: ${
          error instanceof Error ? error.message : 'Failed to submit solution'
        }`,
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Transition appear show={openModal} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10 font-serif"
          onClose={handleOnClose}
        >
          {/* Rest of your modal UI code remains the same */}
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
                <Dialog.Panel className="w-[80%] transform overflow-hidden rounded-lg pb-3 bg-[#00000091] border border-gray-800 text-left align-middle shadow-xl transition-all">
                  {/* Your existing modal content */}
                  <div className="relative h-[120px] w-full">
                    <img
                      src="/warrior.webp"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute top-0 left-0 h-full w-full bg-black opacity-60"></div>
                    <p className="absolute top-[36px] px-[300px] right-[70px] transform text-white text-3xl font-bold">
                      Submit an{' '}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mr-1">
                        Entry
                      </span>
                    </p>
                  </div>

                  {/* Form content */}
                  <div className="mt-4 pr-10 pl-2 flex w-full text-center justify-center">
                    <div className="w-[100%]">
                      {base64Image && (
                        <div>
                          <img
                            src={`data:image/jpeg;base64,${base64Image}`}
                            alt=""
                            className="rounded-xl w-[700px] h-[420px]  object-cover"
                          />
                          <div className="pt-1 text-start text-white"></div>
                        </div>
                      )}
                      <div>
                        <button
                          className="text-white border-purple-300 border focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-8 mt-5 py-2 hover:opacity-70"
                          onClick={handleGenerateImages}
                          disabled={isGenerating}
                        >
                          {isGenerating ? 'Generating...' : 'Generate Image'}
                        </button>
                      </div>
                    </div>

                    <div className="text-white w-[50%]">
                      <form
                        className="ml-[10px] w-[300px] mt-6"
                        onSubmit={submitEntry}
                      >
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            name="floating"
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-purple-600 peer"
                            placeholder=" "
                            required
                            value={submissionName}
                            onChange={(e) => setSubmissionName(e.target.value)}
                          />
                          <label className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
                            Entry Name
                          </label>
                        </div>

                        <div className="w-full mb-6">
                          <textarea
                            className="w-[360px] h-[200px] p-2 bg-transparent border border-gray-600 placeholder:text-sm placeholder:text-gray-600 rounded-md placeholder:p-2 text-sm outline-none focus:outline-none focus:ring-0"
                            placeholder="Add your generative prompt to create entry image"
                            required
                            value={submissionDescription}
                            onChange={(e) =>
                              setSubmissionDescription(e.target.value)
                            }
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={
                            isSubmitting || !base64Image || !smartAccount
                          }
                          className={`text-white bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 mt-3 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-lg text-sm font-bold w-[100px] sm:w-[200px] px-4 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800 ${
                            isSubmitting || !base64Image || !smartAccount
                              ? 'opacity-50 cursor-not-allowed'
                              : ''
                          }`}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Solution'}
                        </button>
                      </form>
                    </div>
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

export default MakeSubmissionModal;

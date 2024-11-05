/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import hoursToSeconds from '@/utils/hoursToSeconds';
import { useQueryClient } from '@tanstack/react-query';

const CreateChallengeModal = ({ openMintModal, handleOnClose }) => {
  const queryClient = useQueryClient();
  const account = '';
  const [imageFile, setImageFile] = useState(null);
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

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
    }
  };

  const handleCreateChallenge = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      const imagePinataResponse = await axios.post(pinataEndpoint, formData, {
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: pinataApiKey,
          pinata_secret_api_key: pinataSecretApiKey,
        },
      });

      if (!imagePinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload image to Pinata');
      }

      const imageUrl = `https://gateway.pinata.cloud/ipfs/${imagePinataResponse.data.IpfsHash}`;

      const metadata = {
        name: challengeName,
        description: challengeDescription,
        image: imageUrl,
        prize: challengePrize,
        duration: challengeDuration,
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
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
            pinata_api_key: pinataApiKey,
            pinata_secret_api_key: pinataSecretApiKey,
          },
        }
      );

      if (!metadataPinataResponse.data.IpfsHash) {
        throw new Error('Failed to upload metadata to Pinata');
      }

      const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataPinataResponse.data.IpfsHash}`;

      setChallengeName('');
      setChallengeDescription('');
      setChallengeDuration('');
      setChallengePrize('');
      setSelectedImage('/placeholder.jpg');
      setImageFile(null);
      handleOnClose();
    } catch (error) {
      console.error('Error in challenge creation process:', error);
      toast.error(`Error: ${error.message}`);
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
                      <form className="ml-[40px] w-[400px] mt-6">
                        <div className="relative z-0 w-full mb-6 group">
                          <input
                            name="floating"
                            className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b-2 border-gray-500 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-purple-500 focus:outline-none focus:ring-0 focus:border-purple-600 peer"
                            placeholder=" "
                            required
                            onChange={(e) => setChallengeName(e.target.value)}
                          />
                          <label
                            for="floating"
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
                            for="floating_repeat"
                            className="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-purple-600 peer-focus:dark:text-purple-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                          >
                            Prompt NFT Description (Optional)
                          </label>
                        </div>

                        <div class="text-gray-400 flex flex-col items-center mt-6">
                          <label for="quantity" class="block mb-1">
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
                            <ClipLoader
                              color="#f0f0f0"
                              size="20px"
                              height="30px"
                              width="3px"
                            />
                          </button>
                        ) : (
                          <button
                            type="submit"
                            className="text-white  bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 mt-3 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300  rounded-lg text-sm font-bold w-[140px] sm:w-auto px-8 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                            // onClick={appropriateCreateChallengeFunction}
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

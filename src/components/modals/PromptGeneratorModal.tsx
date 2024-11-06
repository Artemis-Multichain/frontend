/* eslint-disable @next/next/no-html-link-for-pages */

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

import { AiOutlineInfoCircle } from 'react-icons/ai';
import { SiChainguard } from 'react-icons/si';
import { usePromptGeneration } from '@/hooks/usePromptGeneration';
import LoadingButton from './components/LoadingButton';

const PromptGeneratorModal = ({
  openModal,
  handleOnClose,
  onSendPrompt,
}: {
  openModal: boolean;
  handleOnClose: () => void;
  onSendPrompt: (prompt: string) => void;
}) => {
  const [promptInput, setPromptInput] = useState('');
  const { loading, generatedPrompt, requestPrompt, isInitialized } =
    usePromptGeneration();

  const handlePromptRequest = async () => {
    if (!isInitialized) {
      alert('Please connect your wallet first');
      return;
    }

    if (!promptInput.trim()) {
      alert('Please enter a prompt first');
      return;
    }

    try {
      console.log('🎮 Starting prompt generation for:', promptInput);
      await requestPrompt(promptInput);
    } catch (error) {
      console.error('❌ Component error:', error);
    }
  };

  const handleSendPrompt = () => {
    if (onSendPrompt && generatedPrompt) {
      onSendPrompt(generatedPrompt);
      handleOnClose();
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
                <Dialog.Panel className="w-[56%]  transform overflow-hidden rounded-lg bg-black/90 border border-gray-800  text-left align-middle shadow-xl transition-all text-white">
                  <div>
                    <div className="relative h-[150px] w-full">
                      <img
                        src="/generatorbg.png"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute top-0 left-0 h-full w-full bg-black opacity-10"></div>
                      <div className="absolute inset-0 flex items-center justify-center mb-12">
                        <p className="text-white text-2xl font-bold">
                          Welcome to &nbsp;
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 mr-1">
                            Prompt Generator
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="py-1">
                      <p className="text-sm px-4 py-4 flex items-center gap-3 text-gray-400">
                        <AiOutlineInfoCircle className="text-6xl" />
                        Our prompt generator takes your basic idea and elevates
                        it to new heights of creativity. It's designed to expand
                        your initial prompt into a rich tapestry of imaginative
                        possibilities.
                      </p>
                    </div>
                    <div className="mx-6">
                      <textarea
                        id="success"
                        className="bg-[#0b0f172d] border border-gray-500 text-gray-200 dark:text-gray-400 placeholder-gray-500 dark:placeholder-gray-500 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-300 focus:outline-none block w-[100%] p-1.5 dark:bg-gray-700 dark:border-gray-500"
                        placeholder="a flying car..."
                        onChange={(e) => setPromptInput(e.target.value)}
                      />
                    </div>

                    <div className="text-center py-6">
                      {loading ? (
                        <LoadingButton className="text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-lg text-sm font-bold w-[10px] sm:w-auto px-14 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800" />
                      ) : (
                        <button
                          type="submit"
                          className="text-white bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:bg-purple-800 focus:ring-4 focus:outline-none focus:ring-purple-300 rounded-lg text-sm font-bold w-[140px] sm:w-auto px-5 py-2 text-center dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-800"
                          onClick={handlePromptRequest}
                        >
                          &#128161; Spark Ideas
                        </button>
                      )}
                    </div>
                    <div className="py-6 px-6 flex font-normal text-sm">
                      <p className="flex items-center p-1 border border-gray-400 rounded-lg">
                        <SiChainguard className="text-4xl text-pink-500" />:
                      </p>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      <div className="border-[6px] p-2  border-[#1a1919c5] flex items-center gap-4">
                        <p className="w-[90%] min-w-[500px]">
                          {generatedPrompt}
                        </p>
                        <div className="w-[20%]">
                          <button
                            className="text-white  border-gray-500 border-[1px] hover:opacity-80 focus:ring-4 focus:outline-none focus:ring-gray-300  rounded-lg text-sm font-bold w-[140px] sm:w-auto px-2 py-2 text-center dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800"
                            onClick={handleSendPrompt}
                          >
                            Use Prompt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default PromptGeneratorModal;

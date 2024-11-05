/* eslint-disable @next/next/no-html-link-for-pages */
// @ts-nocheck
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState } from 'react';

const ConnectModal = ({
  openMintModal,
  handleOnClose,
  connectMetamask,
  connectMoon,
  isMoonConnected,
  isMetamaskConnected,
}) => {
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
            <div className="fixed inset-0 bg-black/50" aria-hidden="true" />

            <div className="flex min-h-full  items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl py-10 bg-black/60 border border-gray-400 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-xl font-medium leading-6 text-center py-4 text-gray-100"
                  >
                    Choose a Wallet
                  </Dialog.Title>

                  <div className="mt-4 flex gap-2 w-full text-center items-center justify-center">
                    <div>
                      <button
                        type="button"
                        className="text-white   focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-4 py-2 hover:opacity-70 flex flex-col items-center"
                        disabled={isMoonConnected}
                        onClick={connectMetamask}
                      >
                        <img
                          src="/metamask.png"
                          alt=""
                          className="w-[40px] h-[40px]"
                        />
                        Metamask
                      </button>
                    </div>
                    &nbsp;&nbsp;&nbsp;
                    <button
                      className="text-white  focus:ring-4 focus:outline-none focus:ring-purple-300 font-medium rounded-xl text-sm px-4 py-2 hover:opacity-70 flex flex-col items-center"
                      disabled={isMetamaskConnected}
                      onClick={connectMoon}
                    >
                      <img
                        src="/moon.png"
                        alt=""
                        className="w-[40px] h-[40px]"
                      />
                      <span>Moon Wallet</span>
                    </button>
                    &nbsp;&nbsp;
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

export default ConnectModal;

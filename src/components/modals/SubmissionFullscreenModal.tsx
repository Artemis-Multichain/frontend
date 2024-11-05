// @ts-nocheck
import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { RiCloseCircleLine } from 'react-icons/ri';

const SubmissionFullscreenModal = ({
  isOpen,
  handleClose,
  imageSrc,
  description,
}) => {
  const handleCloseClick = (e) => {
    e.stopPropagation();
    handleClose();
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50 font-serif"
        onClose={handleClose}
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
          <div className="fixed inset-0 bg-black bg-opacity-90" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-transparent p-6 text-left align-middle shadow-xl transition-all">
                <button
                  onClick={handleCloseClick}
                  className="absolute top-4 right-4 text-white text-3xl cursor-pointer z-60 bg-transparent border-none"
                >
                  <RiCloseCircleLine />
                </button>
                <img
                  src={imageSrc}
                  alt="Fullscreen view"
                  className="w-full h-auto max-h-[70vh] object-contain mb-4"
                />
                <div className="bg-black bg-opacity-70 p-4 rounded-lg text-center">
                  <p className="text-white text-lg">{description}</p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SubmissionFullscreenModal;

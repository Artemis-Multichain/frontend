// @ts-nocheck
import { useState } from 'react';
import { MdOutlineViewInAr } from 'react-icons/md';
import CreateNftModal from '../modals/CreateNftModal';

const GenerationOutputCard = ({ image }) => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  return (
    <div className=" w-full text-gray-300 z-9">
      <div
        className=" shadow  rounded-lg border-t-4 border-b-4 border-r-[1px] border-l-[1px] border-purple-900   bg-clip-padding backdrop-filter  bg-opacity-10 rex cursor-pointer"
        onClick={handleOpenModal}
      >
        <img
          src={image}
          alt=""
          className="w-[100%] h-[340px] object-cover rex"
        />
      </div>
      <CreateNftModal
        openModal={openModal}
        handleOnClose={() => setOpenModal(false)}
        image={image}
      />
    </div>
  );
};

export default GenerationOutputCard;

// @ts-nocheck
import React from 'react';
import NftList from './NftList';
import GenerationOutput from './GenerationOutput';
// import History from './History';

const TabContent = ({ activeTab }) => {
  switch (activeTab) {
    case 'Generation Output':
      return (
        <div className="text-white ml-[210px] bg-black h-full">
          <GenerationOutput />{' '}
        </div>
      );
    case 'NFTs':
      return (
        <div className="ml-[200px]">
          <NftList />
        </div>
      );
    case 'History':
      return <div className="ml-[200px]">{/* <History /> */}</div>;
    default:
      return null;
  }
};

export default TabContent;

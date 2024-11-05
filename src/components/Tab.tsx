import React, { useState } from 'react';
import TabContent from './TabContent';

const Tab = () => {
  const [activeTab, setActiveTab] = useState('Generation Output');

  const TabList = () => {
    switch (activeTab) {
      case 'Generation Output':
        return <div>Generation Output</div>;
      // case 'Image Enhancement':
      //   return <div>Image Enhancement</div>;
      // case 'History':
      //   return (
      //     <div>
      //       Image To Image <span>coming</span>
      //     </div>
      //   );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex justify-start pl-[282px] mt-[20px] space-x-4 mb-4 border-b-[1px] border-gray-500 w-full h-full">
        {['Generation Output'].map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2  ${
              activeTab === tab
                ? 'border-[#d536f5] border-b-[2px] text-white rounded-lg'
                : ' text-[#6C6E73] font-bold'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      <TabContent activeTab={activeTab} />
    </div>
  );
};

export default Tab;

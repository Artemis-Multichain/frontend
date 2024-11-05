import React, { useState } from 'react';
import UserGenerations from './UserGenerations';
import Following from './Following';

interface Tab {
  id: string;
  label: string;
  component: React.ReactNode;
}

const tabs: Tab[] = [
  {
    id: 'your-generations',
    label: 'Your Generations',
    component: <UserGenerations />,
  },
  {
    id: 'personalized-feed',
    label: 'Personalized Feed',
    component: <Following />,
  },
  // {
  //   id: 'liked-feed',
  //   label: 'Liked Feed',
  //   component: <div>Liked Feed Content</div>,
  // },
];

const SocialHeader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('your-generations');

  const renderActiveTabContent = () => {
    const activeTabData = tabs.find((tab) => tab.id === activeTab);
    return activeTabData ? activeTabData.component : null;
  };

  return (
    <div className="py-4">
      <h1 className="text-white text-lg mb-4 ml-60">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 font-bold">
          Personal
        </span>
        {' Feed'}
      </h1>
      <div className="flex flex-col ml-60">
        <div className="flex gap-4 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-indigo-500 via-pink-500 to-pink-500 shadow text-white font-bold'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-4">{renderActiveTabContent()}</div>
      </div>
    </div>
  );
};

export default SocialHeader;

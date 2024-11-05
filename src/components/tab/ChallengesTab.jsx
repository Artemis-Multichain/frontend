import { useState } from 'react';
import { Tab } from '@headlessui/react';
import ActiveChallenges from './ActiveChallenges';
import CompletedChallenges from './CompletedChallenges';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ChallengesTab() {
  let [categories] = useState(['Ongoing', 'Completed']);

  return (
    <div className="w-full items-center justify-center flex flex-col px-2 sm:px-0">
      <Tab.Group>
        <Tab.List className="flex space-x-3 rounded-xl bg-black/40 mb-4 p-1">
          {categories.map((category) => (
            <Tab
              key={category}
              className={({ selected }) =>
                classNames(
                  'w-[100px] rounded-lg py-1.5 text-sm font-medium leading-5 text-gray-400 bg-white/20',
                  ' ',
                  selected
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow text-white'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-gray-500'
                )
              }
            >
              {category}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <ActiveChallenges />
          </Tab.Panel>
          <Tab.Panel>
            <CompletedChallenges />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
}

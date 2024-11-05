import React, { useState, useRef, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { MdBorderAll, MdChevronLeft, MdChevronRight } from 'react-icons/md';
import { GiBallGlow } from 'react-icons/gi';
import {
  FaPaintBrush,
  FaPortrait,
  FaCamera,
  FaRegSmileBeam,
} from 'react-icons/fa';
import { PiAlienLight } from 'react-icons/pi';
import { FaGhost } from 'react-icons/fa';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function ExploreTab() {
  const [categories] = useState({
    All: { icon: MdBorderAll },
    '3D Art': { icon: GiBallGlow },
    Comic: { icon: FaPaintBrush },
    Portraits: { icon: FaPortrait },
    Photography: { icon: FaCamera },
    'Sci-fi': { icon: PiAlienLight },
    Fantasy: { icon: FaRegSmileBeam },
    Mystery: { icon: FaGhost },
  });

  const [scrollPosition, setScrollPosition] = useState(0);
  const tabListRef = useRef(null);

  const maxVisibleTabs = 7;
  const categoryEntries = Object.entries(categories);

  const handleScroll = (direction) => {
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - 1)
        : Math.min(categoryEntries.length - maxVisibleTabs, scrollPosition + 1);
    setScrollPosition(newPosition);
  };

  useEffect(() => {
    if (tabListRef.current) {
      tabListRef.current.scrollTo({
        left: scrollPosition * 120,
        behavior: 'smooth',
      });
    }
  }, [scrollPosition]);

  const showLeftScroll = scrollPosition > 0;
  const showRightScroll =
    scrollPosition < categoryEntries.length - maxVisibleTabs;

  return (
    <div className="w-full ml-[220px] px-2 sm:px-0 relative">
      <Tab.Group>
        <div className="flex items-center">
          {showLeftScroll && (
            <button
              onClick={() => handleScroll('left')}
              className="absolute left-0 z-10 bg-black/40 p-2 rounded-l-xl"
            >
              <MdChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          <Tab.List
            ref={tabListRef}
            className="flex space-x-3 rounded-xl bg-black/40 p-1 overflow-hidden"
            // style={{ width: `${maxVisibleTabs * 120}px` }}
          >
            {categoryEntries.map(([category, { icon: Icon }], index) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    'w-[120px] rounded-lg py-2 px-2 text-xs font-medium leading-5 text-gray-400 bg-neutral-900',
                    'flex items-center justify-center space-x-2 focus:border-none',
                    selected
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow text-white'
                      : 'text-blue-100 hover:bg-white/[0.12] hover:text-gray-500'
                  )
                }
              >
                <Icon className="w-5 h-5" />
                <span>{category}</span>
              </Tab>
            ))}
          </Tab.List>
          {/* {showRightScroll && (
            <button
              onClick={() => handleScroll('right')}
              className="absolute right-0 z-10 bg-black/40 p-2 rounded-r-xl"
            >
              <MdChevronRight className="w-6 h-6 text-white" />
            </button>
          )} */}
        </div>
      </Tab.Group>
    </div>
  );
}

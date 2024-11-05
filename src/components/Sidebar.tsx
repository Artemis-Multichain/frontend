'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigation } from '@/constants';
import { SiBlockchaindotcom } from 'react-icons/si';
import {
  MdOutlineIntegrationInstructions,
  MdOutlineMoreHoriz,
  MdOutlineSettings,
  MdOutlineBlindsClosed,
} from 'react-icons/md';
import { FaDiceD20 } from 'react-icons/fa6';
import { FiUpload } from 'react-icons/fi';
import { FaRegQuestionCircle, FaMediumM, FaFacebookF } from 'react-icons/fa';
import { BsTwitterX, BsDiscord } from 'react-icons/bs';

const Sidebar = () => {
  // Use usePathname instead of useRouter for client components
  const pathname = usePathname();

  return (
    <>
      <nav
        className="hidden custom-scrollbar fixed top-0 left-0 bg-black shadow-2xl items-center h-screen w-[210px] right-0 navbar mt-0 md:block border-r-[1px] border-gray-800"
        style={{ maxWidth: '100vw', overflowX: 'auto' }}
        aria-label="Sidebar"
      >
        <Link className="flex items-center ml-7 mt-6" href="/">
          <FaDiceD20 className="text-white text-[24px]" />
          &nbsp;&nbsp;
          <h2 className="font-extrabold text-[24px] leading-[30px] text-white">
            Artemis{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-800">
              AI
            </span>
          </h2>
        </Link>

        <ul className="list-none mt-12 ml-2 flex flex-col sm:flex justify-start items-start gap-4 flex-1 text-gray-300">
          <p className="text-[14px] text-gray-400 font-bold text-center ml-4">
            Start Here
          </p>

          {navigation.map((item) => (
            <Link key={item.name} href={item.href} scroll={false}>
              <span
                className={`font-poppins flex items-center font-normal cursor-pointer text-[12px] p-2  ${
                  pathname === item.href
                    ? 'text-white w-[190px] font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-md transition-all duration-500'
                    : 'text-gray-400 hover:opacity-80'
                }`}
              >
                <div className="text-[16px] bg-transparent">{item.icon}</div>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <div className="text-[13px] bg-transparent">{item.name}</div>
              </span>
            </Link>
          ))}

          <p className="text-[13px] text-gray-400 font-bold text-center ml-2">
            AI Tools
          </p>

          <Link href="/generate" scroll={false}>
            <span
              className={`font-poppins flex items-center font-normal cursor-pointer text-[15px] mb-2 ${
                pathname === '/generate'
                  ? 'text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-2 px-6 rounded-md transition-all duration-500'
                  : 'text-secondary-white px-2 hover:opacity-80'
              }`}
            >
              <div className="text-[16px]">
                <MdOutlineIntegrationInstructions />
              </div>
              &nbsp;&nbsp;
              <div className="flex items-center text-[13px] text-gray-400">
                <p>Image Generation</p>
              </div>
            </span>
          </Link>

          <Link href="/generate" scroll={false}>
            <span
              className={`font-poppins flex items-center font-normal cursor-pointer text-[15px] mb-2 ${
                pathname === '/generate'
                  ? 'text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-2 px-3 rounded-md transition-all duration-500'
                  : 'text-secondary-white px-2 hover:opacity-80'
              }`}
            >
              <div className="text-[16px]">
                <MdOutlineBlindsClosed />
              </div>
              &nbsp;&nbsp;
              <div className="flex items-center text-[13px] text-gray-400">
                <p>Motion Generation</p>
              </div>
            </span>
          </Link>

          {/* Account Section */}
          <p className="text-[13px] text-gray-400 font-bold text-center ml-2">
            Account
          </p>

          <Link href="/send-tokens" scroll={false}>
            <span
              className={`font-poppins flex items-center font-normal cursor-pointer text-[14px] ${
                pathname === '/send-tokens'
                  ? 'text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-2 px-6 rounded-md transition-all duration-500'
                  : 'text-secondary-white px-2 hover:opacity-80'
              }`}
            >
              <div className="text-[14px]">
                <FiUpload />
              </div>
              &nbsp;&nbsp;
              <div className="flex items-center">
                <p className="text-[13px] text-gray-400">Profile</p>
                &nbsp; &nbsp;
                <span className="text-[12px] p-[4px] bg-purple-600 rounded-lg">
                  beta
                </span>
              </div>
            </span>
          </Link>

          {/* Footer Links */}
          <li className="flex flex-col ml-2 mt-10">
            <span className="flex items-center text-gray-400 text-[13px]">
              <MdOutlineSettings className="text-[16px]" />
              &nbsp; Settings
            </span>
            <span className="flex items-center text-gray-400 mt-4 text-[13px]">
              <MdOutlineMoreHoriz className="text-[16px]" />
              &nbsp; More
            </span>
            <span className="flex items-center text-gray-400 mt-4 text-[13px]">
              <FaRegQuestionCircle className="text-[16px]" />
              &nbsp; FAQ & Support
            </span>

            <span className="flex items-center text-gray-400 mt-8 text-sm">
              &nbsp; Terms of Service
            </span>

            <span className="flex gap-3 items-center text-gray-400 mt-4">
              <BsTwitterX className="text-lg" />
              <BsDiscord className="text-lg" />
              <FaMediumM className="text-lg" />
              <FaFacebookF className="text-lg" />
            </span>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;
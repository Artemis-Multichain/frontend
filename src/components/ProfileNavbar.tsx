'use client';

import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import CreateChallengeModal from './modals/CreateChallengeModal';
import {
  ConnectButton,
  useAccount,
  useSmartAccount,
  usePublicClient,
  useParticleAuth,
  useModal,
} from '@particle-network/connectkit';
import { formatEther } from 'viem';
import { formatBalance } from '@/utils/particle-utils';
import { useAAStore } from '@/store/aaStore';
import { formatAddress } from '@/utils/formatAddress';
import { useAllocationModal } from '@/hooks/useAllocationModal';

const ProfileNavbar = () => {
  const { isConnected, chainId, address, isConnecting, isDisconnected, chain } =
    useAccount();
  const smartAccount = useSmartAccount();
  const { getUserInfo } = useParticleAuth();
  const publicClient = usePublicClient();
  const [openModal, setOpenModal] = useState(false);
  const { setOpen } = useModal();
  const [userAddress, setUserAddress] = useState<string>('');

  const [userInfo, setUserInfo] = useState<Record<string, any> | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [recipientAddress, setRecipientAddress] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const toggleAA = useAAStore((state) => state.toggleAA);
  const isAADisabled = useAAStore((state) => state.isAADisabled);
  const openAllocationModal = useAllocationModal((state) => state.openModal);

  const fetchBalance = async (address: string) => {
    try {
      const balanceResponse = await publicClient?.getBalance({
        address: address as `0x${string}`,
      });

      if (balanceResponse) {
        const balanceInEther = formatEther(balanceResponse);
        setBalance(formatBalance(balanceInEther));
      } else {
        console.error('Balance response is undefined');
        setBalance('0.0');
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useEffect(() => {
    const loadAccountData = async () => {
      try {
        if (isConnected && smartAccount) {
          const address = await smartAccount.getAddress();
          console.log('Address:', address);

          setUserAddress(address);
          fetchBalance(address);
        }

        if (isConnected) {
          const info = getUserInfo();
          setUserInfo(info);
        }
      } catch (error) {
        console.error('Error loading account data:', error);
      }
    };

    loadAccountData();
  }, [isConnected, smartAccount, getUserInfo, chainId]);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  console.log('User Address:', address);

  return (
    <nav
      className={`ml-[210px] h-1/2 opacity-80 shadow-2xl w-[100%] py-1 border-b-[1px] border-gray-800 bg-[url('/bg-stars.png')] bg-repeat-y bg-center relative mt-2 pb-3`}
    >
      <div
        className={`mx-auto flex flex-row justify-between mt-4 items-center gap-3`}
      >
        <div className="my-4">
          <SearchBar />
        </div>
        <ul className="flex items-center gap-6 absolute right-[120px]">
          <li className="flex gap-4 text-gray-300">
            <a href="/" className="text-sm">
              Docs
            </a>
            <a onClick={handleOpenModal} className="cursor-pointer text-sm">
              Create
            </a>
          </li>
          <li
            onClick={() => setOpen(true)}
            className="text-gray-300 border-purple-600 border p-2 px-5 text-sm rounded-3xl cursor-pointer"
          >
            {isConnected
              ? userAddress && (
                  <span className="flex items-center gap-1">
                    <img
                      src="https://avatars.githubusercontent.com/u/101794619?s=280&v=4"
                      alt=""
                      className="w-5 h-5"
                    />
                    {formatAddress(userAddress)}
                  </span>
                )
              : 'Connect Wallet'}
          </li>
          <li
            className="text-white text-sm"
            onClick={() => openAllocationModal()}
          >
            Unified Balance
          </li>
        </ul>
      </div>
      <CreateChallengeModal
        openMintModal={openModal}
        handleOnClose={() => setOpenModal(false)}
      />
    </nav>
  );
};

export default ProfileNavbar;

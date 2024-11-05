// @ts-nocheck
import { useState, useEffect } from 'react';
import { calculateTimeLeft } from '@/utils/countdownTimer';
import useIpfsData from '@/utils/useIpfsData';
import Link from 'next/link';
import getChallengeImage from '@/utils/challengeImageGenerator';
import { formatAddress } from '@/utils/formatAddress';
import { octasToApt } from '@/utils/aptos/octasToApt';

const CompletedChallengesCard = ({
  id,
  ipfsUrl,
  duration,
  startTime,
  isActive,
  winner,
  numberOfSubmissions,
  challengeImage,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const ipfsData = useIpfsData(ipfsUrl);

  const generateRandomAddress = () => {
    return (
      '0x' +
      Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')
    );
  };

  const formatAddressWithEllipsis = (address) => {
    return `${address.slice(0, 5)}${address.slice(-2)}...`;
  };

  const getWinnerAddress = () => {
    if (numberOfSubmissions > 0) {
      if (winner) {
        return formatAddressWithEllipsis(winner);
      } else {
        const randomAddress = generateRandomAddress();
        return formatAddressWithEllipsis(randomAddress);
      }
    } else {
      return 'No submissions';
    }
  };

  const winnerAddress = getWinnerAddress();

  useEffect(() => {
    const updateTimer = () => {
      const time = calculateTimeLeft(startTime, duration);
      if (time) {
        const timeString = `${time.days}d ${time.hours}h ${time.minutes}m ${time.seconds}s`;
        setTimeLeft(timeString);
      } else {
        setTimeLeft('Challenge Ended');
      }
    };

    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [startTime, duration]);

  const getImageUrl = (ipfsImageUrl) => {
    if (ipfsImageUrl && ipfsImageUrl.trim() !== '') {
      return ipfsImageUrl.replace('ipfs://', 'https://nftstorage.link/ipfs/');
    }

    return '/placeholder.jpg';
  };

  return (
    <div className="w-[328px] cursor-pointer text-gray-300">
      <div className="shadow p-5 rounded-lg border-t-4 border-b-4 border-r-[1px] border-l-[1px] border-purple-900 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 rex h-[420px] flex flex-col justify-between">
        <div>
          <img
            src={getImageUrl(ipfsData.image)}
            alt={ipfsData.name || 'Challenge'}
            className="w-full h-[200px] object-cover rex"
          />

          <p
            className="mt-4 text-2xl text-secondary-white text-center font-medium bg-transparent max-w-[280px] mx-auto truncate"
            title={ipfsData.name}
          >
            {ipfsData.name}
          </p>
          <p className="mt-2 font-bold text-secondary-white text-center text-sm border-purple-400 border-2 mx-2 p-1 rounded-xl">
            Challenge Ended
          </p>
        </div>

        <div>
          <p className="mt-2 font-bold text-secondary-white text-center ">
            {numberOfSubmissions} submissions
          </p>

          <div className="mt-2 px-[20px]">
            <button className="border-gray-400 border-2 hover:opacity-80 px-3 py-2 rounded-lg w-full text-white cursor-default">
              Winner: {winnerAddress}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompletedChallengesCard;

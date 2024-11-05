import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import useIpfsData from '@/utils/useIpfsData';
import { useImages } from '@/context/ImageContext';

const IS_DEPLOYED = process.env.NEXT_PUBLIC_IS_DEPLOYED === 'true';

const TIME_ADJUSTMENT = IS_DEPLOYED ? 3600000 : 0;

const ActiveChallengesCard = ({
  id,
  ipfsUrl,
  duration,
  startTime,
  isActive,
  prize,
  numberOfSubmissions,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const ipfsData = useIpfsData(ipfsUrl);
  const { SetSubmissionHeaderIpfsUri } = useImages();

  useEffect(() => {
    SetSubmissionHeaderIpfsUri(ipfsUrl);
    const calculateTimeLeft = () => {
      const startDate = new Date(startTime);

      const adjustedStartDate = new Date(startDate.getTime() + TIME_ADJUSTMENT);
      const now = new Date();
      const durationInSeconds = parseInt(duration.split(' ')[0]);
      const endDate = new Date(
        adjustedStartDate.getTime() + durationInSeconds * 1000
      );

      if (now >= endDate) {
        return 'Challenge Ended';
      }

      const difference = endDate - now;
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, duration]);

  const getImageUrl = (ipfsImageUrl) => {
    if (ipfsImageUrl && ipfsImageUrl.trim() !== '') {
      return ipfsImageUrl.replace(
        'ipfs://',
        'https://gateway.pinata.cloud/ipfs/'
      );
    }
    return '/placeholder.jpg';
  };

  return (
    <div className="w-[328px] h-[444px] cursor-pointer text-gray-300">
      <div className="shadow p-5 rounded-lg border-t-4 border-b-4 border-r-[1px] border-l-[1px] border-purple-900 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 rex h-[420px] flex flex-col justify-between">
        <img
          src={getImageUrl(ipfsData.image)}
          alt={ipfsData.name || 'Challenge'}
          className="w-[450px] h-[200px] object-cover rex"
        />

        <span className="absolute text-sm top-0 right-0 font-bold border border-purple-700 p-2 rounded-[7px] bg-black">
          Prize: <span className="text-gray-300">{prize} APT </span>
        </span>

        <p className="mt-2 text-2xl text-secondary-white text-center font-medium bg-transparent max-w-[280px] mx-auto truncate">
          {ipfsData.name}
        </p>
        <p className="mt-4 font-bold text-sm text-secondary-white text-center border-purple-400 border-2 mx-2 p-1 rounded-xl">
          {timeLeft} left to submit
        </p>

        <div>
          <p className="mt-4 font-bold text-secondary-white text-center">
            {numberOfSubmissions} submissions
          </p>
        </div>

        <Link
          href="/submissions/[id]"
          as={`/submissions/${id}?ipfsUri=${encodeURIComponent(ipfsUrl)}`}
        >
          <div className="mt-4 px-[50px]">
            <button className="border-gray-400 border-2 hover:opacity-80 px-3 py-2 rounded-lg w-full text-white">
              View Submissions
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default ActiveChallengesCard;

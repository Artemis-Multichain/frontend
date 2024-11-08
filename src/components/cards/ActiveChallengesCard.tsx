import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useImages } from '@/context/ImageContext';
import axios from 'axios';

interface IpfsData {
  name: string;
  image: string;
  description: string;
}

interface ActiveChallengesCardProps {
  id: number;
  ipfsUrl: string;
  duration: number;
  startTime: number;
  isActive: boolean;
  prize: string;
  numberOfSubmissions: number;
  challengeImage: string;
  timeRemaining: number;
  chain?: string;
  displayName?: string;
}

const IS_DEPLOYED = process.env.NEXT_PUBLIC_IS_DEPLOYED === 'true';
const TIME_ADJUSTMENT = IS_DEPLOYED ? 3600000 : 0;

const ActiveChallengesCard: React.FC<ActiveChallengesCardProps> = ({
  id,
  ipfsUrl,
  duration,
  startTime,
  isActive,
  prize,
  numberOfSubmissions,
  timeRemaining,
  chain,
  displayName,
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [ipfsData, setIpfsData] = useState<IpfsData>({
    name: '',
    image: '',
    description: '',
  });
  const { SetSubmissionHeaderIpfsUri } = useImages();

  useEffect(() => {
    SetSubmissionHeaderIpfsUri(ipfsUrl);
    const fetchIpfsData = async () => {
      if (!ipfsUrl) return;

      try {
        // Convert IPFS URL to HTTP URL
        const httpUrl = ipfsUrl.replace(
          'ipfs://',
          'https://gateway.pinata.cloud/ipfs/'
        );

        const metadataResponse = await axios.get(httpUrl);
        const metadata = metadataResponse.data;

        setIpfsData({
          name: metadata.name || 'Untitled Challenge',
          image: metadata.image || '',
          description: metadata.description || '',
        });
      } catch (error) {
        console.error('Error fetching IPFS metadata:', error);
        setIpfsData({
          name: 'Failed to load challenge',
          image: '',
          description: 'Error loading challenge details',
        });
      }
    };

    fetchIpfsData();
  }, [ipfsUrl]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000);
      const endTime = startTime + duration;
      const remaining = endTime - now;

      if (remaining <= 0) {
        return 'Challenge Ended';
      }

      const days = Math.floor(remaining / 86400);
      const hours = Math.floor((remaining % 86400) / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = Math.floor(remaining % 60);

      return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [startTime, duration]);

  const getImageUrl = (ipfsImageUrl: string): string => {
    if (ipfsImageUrl && ipfsImageUrl.trim() !== '') {
      // Handle both ipfs:// and https:// URLs
      return ipfsImageUrl.startsWith('ipfs://')
        ? ipfsImageUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
        : ipfsImageUrl;
    }
    return '/placeholder.jpg';
  };

  const getStatusColor = () => {
    if (!isActive) return 'border-red-700';
    if (timeRemaining < 43200) return 'border-yellow-700'; // Less than 12 hours (43200 seconds)
    return 'border-purple-700';
  };

  return (
    <div className="w-full max-w-[328px] mx-auto">
      <div
        className={`shadow p-5 rounded-lg border-t-4 border-b-4 border-r-[1px] border-l-[1px] ${getStatusColor()} 
          bg-clip-padding bg-opacity-10 h-[420px] flex flex-col justify-between
          transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
      >
        <div className="relative">
          <img
            src={getImageUrl(ipfsData.image)}
            alt={ipfsData.name || 'Challenge'}
            className="w-full h-[200px] object-cover rounded-lg"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.jpg';
            }}
          />

          <div className="absolute top-2 right-2 font-bold border bg-black/90 p-2 rounded-[7px] backdrop-blur-sm flex items-center gap-1">
            <span className="text-xs text-gray-400">Prize:</span>
            <div className="text-gray-300 text-xs">{prize}</div>
          </div>

          {displayName && (
            <div className="absolute top-2 left-2 font-medium border bg-black/90 px-2 py-1 rounded-[7px] backdrop-blur-sm">
              <span className="text-xs text-gray-300">{displayName}</span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between mt-4">
          <div>
            <h3
              className="text-xl text-secondary-white text-center font-medium bg-transparent 
              max-w-[280px] mx-auto truncate hover:text-clip hover:overflow-visible"
            >
              {ipfsData.name || 'Loading...'}
            </h3>

            <div
              className={`mt-3 font-bold text-sm text-center border-2 mx-2 p-1.5 rounded-xl
              ${
                timeRemaining < 43200
                  ? 'border-yellow-400 text-yellow-400'
                  : 'border-purple-400 text-secondary-white'
              }`}
            >
              {timeLeft} remaining
            </div>

            <p className="mt-3 font-bold text-secondary-white text-center">
              {numberOfSubmissions} submission
              {numberOfSubmissions !== 1 ? 's' : ''}
            </p>
          </div>

          <Link
            href="/submissions/[id]"
            as={`/submissions/${id}${chain ? `?chain=${chain}` : ''}${
              ipfsUrl
                ? `${chain ? '&' : '?'}ipfsUri=${encodeURIComponent(ipfsUrl)}`
                : ''
            }`}
            className="block mt-4 px-[50px]"
          >
            <button
              className="border-2 border-gray-400 hover:bg-gray-400/20 px-3 py-2 rounded-lg w-full 
              text-white transition-all duration-300 active:scale-95"
            >
              View Submissions
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActiveChallengesCard;

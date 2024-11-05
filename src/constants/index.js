import { AiOutlineHome, AiOutlineLineChart } from 'react-icons/ai';
import { FiUpload } from 'react-icons/fi';
import { FaExchangeAlt, FaUsers } from 'react-icons/fa';
import { MdOutlineTaskAlt } from 'react-icons/md';
import { BsSearch } from 'react-icons/bs';

export const newFeatures = [
  {
    imgUrl: '/vrpano.svg',
    title: 'A new world',
    subtitle:
      'we have the latest update with new world for you to try never mind',
  },
  {
    imgUrl: '/headset.svg',
    title: 'More realistic',
    subtitle:
      'In the latest update, your eyes are narrow, making the world more realistic than ever',
  },
];

export const socials = [
  {
    name: 'twitter',
    url: '/twitter.svg',
  },
  {
    name: 'linkedin',
    url: '/linkedin.svg',
  },
  {
    name: 'instagram',
    url: '/instagram.svg',
  },
  {
    name: 'facebook',
    url: '/facebook.svg',
  },
];

export const navigation = [
  {
    name: 'Home',
    href: '/home',
    icon: <AiOutlineHome className="bg-transparent" />,
  },
  {
    name: 'My Creations',
    href: '/social-feed',
    icon: <AiOutlineHome className="bg-transparent" />,
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: <FaExchangeAlt className="bg-transparent" />,
  },
  {
    name: 'Challenges',
    href: '/challenges',
    icon: <MdOutlineTaskAlt className="bg-transparent" />,
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: <FaUsers className="bg-transparent" />,
  },
];

export const startingFeatures = [
  'AI image generation platform: Create stunning visuals from text, high-resolution, intuitive interface.',
  'AI-guided image prompt generation: Effortlessly craft detailed prompts, enhance creativity, intuitive suggestions.',
  'Prompt Marketplace: Diverse library of creative prompts, user-contributed content for enhanced creativity.',
];

export const NETWORK = process.env.NEXT_PUBLIC_APP_NETWORK ?? 'testnet';
export const MODULE_ADDRESS = process.env.NEXT_PUBLIC_MODULE_ADDRESS;
export const CREATOR_ADDRESS = process.env.NEXT_PUBLIC_CREATOR_ADDRESS;
export const IS_DEV = Boolean(process.env.DEV);

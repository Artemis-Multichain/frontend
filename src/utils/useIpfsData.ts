import { useState, useEffect } from 'react';
import axios from 'axios';

const IPFS_GATEWAYS = [
  'https://nftstorage.link/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
];

const extractIpfsHash = (url: string): string => {
  // Handle various URL formats
  if (!url) return '';

  // If it's already just a hash, return it
  if (
    /^Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50}$/.test(
      url
    )
  ) {
    return url;
  }

  // Remove any gateway prefixes
  let hash = url;
  for (const gateway of IPFS_GATEWAYS) {
    hash = hash.replace(gateway, '');
  }

  // Remove ipfs:// prefix if present
  hash = hash.replace('ipfs://', '');

  const matches = hash.match(
    /Qm[1-9A-HJ-NP-Za-km-z]{44}|b[A-Za-z2-7]{58}|B[A-Z2-7]{58}|z[1-9A-HJ-NP-Za-km-z]{48}|F[0-9A-F]{50}/
  );
  return matches ? matches[0] : hash;
};

const useIpfsData = (ipfsUrl: string) => {
  const [ipfsData, setIpfsData] = useState({
    name: '',
    image: '',
    description: '',
  });
  const [currentGatewayIndex, setCurrentGatewayIndex] = useState(0);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!ipfsUrl) {
        console.log('No IPFS URL provided');
        return;
      }

      const hash = extractIpfsHash(ipfsUrl);
      console.log('Extracted IPFS hash:', hash);

      const tryNextGateway = async (index: number): Promise<void> => {
        if (index >= IPFS_GATEWAYS.length) {
          console.error('All IPFS gateways failed');
          return;
        }

        try {
          const url = `${IPFS_GATEWAYS[index]}${hash}`;
          console.log('Trying IPFS gateway:', url);

          const metadataResponse = await axios.get(url, {
            timeout: 5000,
          });

          const metadata = metadataResponse.data;

          // Extract hash from image URL if it's IPFS
          const imageHash = metadata.image
            ? extractIpfsHash(metadata.image)
            : '';
          const imageUrl = imageHash
            ? `${IPFS_GATEWAYS[index]}${imageHash}`
            : metadata.image;

          setIpfsData({
            name: metadata.name || '',
            image: imageUrl || '',
            description: metadata.description || '',
          });

          setCurrentGatewayIndex(index);
        } catch (error) {
          console.error(`Gateway ${IPFS_GATEWAYS[index]} failed:`, error);
          await tryNextGateway(index + 1);
        }
      };

      tryNextGateway(currentGatewayIndex);
    };

    fetchMetadata();
  }, [ipfsUrl, currentGatewayIndex]);

  return ipfsData;
};

export default useIpfsData;

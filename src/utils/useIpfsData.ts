import { useState, useEffect } from 'react';
import axios from 'axios';

const useIpfsData = (ipfsUrl: string) => {
  const [ipfsData, setIpfsData] = useState({
    name: '',
    image: '',
    description: '',
  });

  useEffect(() => {
    const fetchMetadata = async () => {
      if (!ipfsUrl) {
        console.log('No IPFS URL provided');
        return;
      }

      try {
        const metadataResponse = await axios.get(ipfsUrl);
        const metadata = metadataResponse.data;
        setIpfsData({
          name: metadata.name,
          image: metadata.image,
          description: metadata.description,
        });
      } catch (error) {
        console.error('Error fetching IPFS metadata:', error);
      }
    };

    fetchMetadata();
  }, [ipfsUrl]);

  return ipfsData;
};

export default useIpfsData;

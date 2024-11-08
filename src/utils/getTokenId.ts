interface OpenSeaNFT {
  identifier: string;
  metadata_url: string;
}

interface OpenSeaResponse {
  nfts: OpenSeaNFT[];
}

const CONTRACT_ADDRESSES = {
  base_sepolia: '0x338A8D070eD0AD108A02b4A85D789e16a8640933',
  arbitrum_sepolia: '0x47887dC0305769285d8d793C3dd669f61274e959',
} as const;

type ChainName = keyof typeof CONTRACT_ADDRESSES;

/**
 * Finds the NFT identifier for a given CID on specified chain
 * @param cid - The IPFS CID to match against metadata URLs
 * @param chain - The chain name ('base_sepolia' or 'arbitrum_sepolia')
 * @returns The identifier of the matching NFT or null if not found
 */
export const findNFTIdentifierByCID = async (
  cid: string,
  chain: ChainName
): Promise<string | null> => {
  const contractAddress = CONTRACT_ADDRESSES[chain];
  const baseUrl = 'https://testnets-api.opensea.io/api/v2/chain';

  try {
    // Normalize CID for comparison (handle both IPFS gateway URLs and raw CIDs)
    const normalizedSearchCid = cid.includes('/ipfs/')
      ? cid.split('/ipfs/')[1]
      : cid;

    const response = await fetch(
      `${baseUrl}/${chain}/contract/${contractAddress}/nfts`,
      {
        method: 'GET',
        headers: {
          accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `OpenSea API error: ${response.status} ${response.statusText}`
      );
    }

    const data: OpenSeaResponse = await response.json();
    console.log(data);

    // Find the NFT with matching metadata URL
    const matchingNFT = data.nfts.find((nft) => {
      const nftCid = nft.metadata_url.includes('/ipfs/')
        ? nft.metadata_url.split('/ipfs/')[1]
        : nft.metadata_url;
      return nftCid === normalizedSearchCid;
    });

    console.log('Matching NFT:', matchingNFT?.identifier);

    return matchingNFT?.identifier || null;
  } catch (error) {
    console.error('Error fetching NFT data:', error);
    throw error;
  }
};

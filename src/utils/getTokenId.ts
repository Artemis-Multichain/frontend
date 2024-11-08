interface OpenSeaNFT {
  identifier: string;
  metadata_url: string;
}

interface OpenSeaResponse {
  nfts: OpenSeaNFT[];
}

const CONTRACT_ADDRESSES = {
  base_sepolia: '0xFC0b043A8699b2fBFf894786F3D7A234D397a563',
  arbitrum_sepolia: '0x1b00C03bF2b798cfa2980538855c9357c3bB1CD1',
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

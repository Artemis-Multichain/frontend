import React, { useContext } from 'react';
import NftCard from './NftCard';

const first =
  'https://images.unsplash.com/photo-1597773150796-e5c14ebecbf5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3QlMjBibHVlfGVufDB8fDB8fHww&w=1000&q=80';

const second =
  'https://www.thestreet.com/.image/t_share/MTgyMDU5NDcwMTc4NzU1NzE1/boredape1.jpg';

const NftList = () => {
  return (
    <div className="flex flex-wrap gap-16">
      {/* <NftCard key={nft.contract_address} name={nft.name} image={nft.image} /> */}

      {/* <NftCard image={first} />
      <NftCard image={second} /> */}
    </div>
  );
};

export default NftList;

export const shortenAddress = (address: string) => {
  if (!address) return '';
  const firstSix = address.slice(0, 4);
  const lastFour = address.slice(-4);
  return `${firstSix}...${lastFour}`;
};

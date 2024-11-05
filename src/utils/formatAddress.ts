export const formatAddress = (address: string | any[], charsToShow = 8) => {
  if (!address || address.length < charsToShow * 2 + 3) {
    return address;
  }

  const start = address.slice(0, charsToShow);
  const end = address.slice(-charsToShow);
  return `${start}...`;
};

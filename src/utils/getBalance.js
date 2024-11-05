import { ethers } from 'ethers';

export default async function fetchAndSetAccountBalance(
  account,
  isConnected,
  setBalanceCallback
) {
  if (isConnected && account) {
    const provider = new ethers.providers.JsonRpcProvider(
      'http://18.185.76.64:8080'
    );

    try {
      const balanceBigNumber = await provider.getBalance(account);
      const formattedBalance = ethers.utils.formatEther(balanceBigNumber);
      setBalanceCallback(formattedBalance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }
}

/**
 * Converts USD to cents.
 * @param {number} usdValue - The amount in USD.
 * @return {number} The amount in cents.
 */

const usdValue = 1

export default function convertUSDToCents() {
 
  if (typeof usdValue !== 'number' || isNaN(usdValue) || usdValue < 0) {
    throw new Error('Invalid input: usdValue must be a positive number.');
  }

  const cents = usdValue * 100;

  return Math.round(cents);
}

import CryptoJS from 'crypto-js';

export default function generateKey(string: string) {
  if (!string) {
    throw new Error('String is required');
  }

  // Create a SHA-256 hash of the address
  const hash = CryptoJS.SHA256(string).toString();

  const bigIntHash = BigInt('0x' + hash);
  const hashString = bigIntHash.toString();

  const key = hashString.substring(0, 5);

  return key;
}

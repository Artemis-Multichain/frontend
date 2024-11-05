import CryptoJS from 'crypto-js';

export function encryptPrompt(prompt: string, secretKey: string): string {
  return CryptoJS.AES.encrypt(prompt, secretKey).toString();
}


export function decryptPrompt(ciphertext: string, secretKey: string): string {
  try {
    console.log('Attempting to decrypt ciphertext:', ciphertext);
    console.log('Using secret key:', secretKey);

    if (!ciphertext) {
      throw new Error('Ciphertext is undefined or empty');
    }

    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    console.log('Decrypted bytes:', bytes.toString());

    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    console.log('Decrypted string:', decrypted);

    if (!decrypted) {
      throw new Error('Decryption resulted in an empty string');
    }

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}


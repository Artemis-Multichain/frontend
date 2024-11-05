export const hexToString = (hex: string) => {
  if (!hex || typeof hex !== 'string') {
    throw new Error('Invalid input: Input should be a hexadecimal string.');
  }

  hex = hex.replace(/^0x/, '');

  let str = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (!isNaN(code) && code !== 0) {
      str += String.fromCharCode(code);
    }
  }
  return str;
};

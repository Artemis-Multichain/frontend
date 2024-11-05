function base64ToBlob(
  base64Data: string,
  contentType: string = '',
  sliceSize: number = 512
): Blob {
  let base64WithoutPrefix = base64Data;

  // Check if the base64 string contains the 'data:' prefix
  if (base64Data.includes('data:') && base64Data.includes(';base64,')) {
    // Extract the content type if not provided and strip off the 'data:' prefix
    if (!contentType) {
      contentType = base64Data.substring(5, base64Data.indexOf(';'));
    }
    base64WithoutPrefix = base64Data.split(',')[1];
  }

  const byteCharacters = atob(base64WithoutPrefix);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

export default base64ToBlob;

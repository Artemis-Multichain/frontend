export default function extractStrings(address: string) {
  if (!address || address.length < 5) {
    // checking if the address exists and is at least 5 characters long
    console.error(
      'No address is provided or address is too short for extraction.'
    );
    return;
  }

  let firstThree = address.substring(0, 3);
  let lastTwo = address.substring(address.length - 2);
  return firstThree + lastTwo;
}

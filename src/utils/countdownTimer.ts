// @ts-nocheck
export const calculateTimeLeft = (startTime, duration) => {
  const endTime = new Date(startTime * 1000 + duration * 1000);
  const now = new Date();
  const difference = endTime - now;

  if (difference > 0) {
    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return null;
};

import { useState, useEffect } from 'react';

const useYearAgnosticCountdown = (startTimeISO, durationString) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const startTime = new Date(startTimeISO);
      const durationInSeconds = parseInt(durationString.split(' ')[0]);

      // Adjust dates to the current year
      const adjustedStartTime = new Date(
        now.getFullYear(),
        startTime.getMonth(),
        startTime.getDate(),
        startTime.getHours(),
        startTime.getMinutes(),
        startTime.getSeconds()
      );
      const adjustedEndTime = new Date(
        adjustedStartTime.getTime() + durationInSeconds * 1000
      );

      // If the adjusted start time is in the past, move it to the next day
      if (adjustedStartTime < now) {
        adjustedStartTime.setDate(adjustedStartTime.getDate() + 1);
        adjustedEndTime.setDate(adjustedEndTime.getDate() + 1);
      }

      const debug = {
        originalStartTime: startTimeISO,
        adjustedStartTime: adjustedStartTime.toISOString(),
        adjustedEndTime: adjustedEndTime.toISOString(),
        now: now.toISOString(),
        durationInSeconds,
      };

      if (now >= adjustedEndTime) {
        return { timeLeft: 'Challenge Ended', debug };
      }

      const difference = adjustedEndTime.getTime() - now.getTime();
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      const timeLeft = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      debug.difference = difference;
      debug.timeLeft = timeLeft;

      return { timeLeft, debug };
    };

    const updateCountdown = () => {
      const { timeLeft, debug } = calculateTimeLeft();
      setTimeLeft(timeLeft);
      setDebugInfo(debug);
    };

    // Initial calculation
    updateCountdown();

    // Update every second
    const timerId = setInterval(updateCountdown, 1000);

    // Cleanup interval on component unmount
    return () => clearInterval(timerId);
  }, [startTimeISO, durationString]);

  return { timeLeft, debugInfo };
};

export default useYearAgnosticCountdown;

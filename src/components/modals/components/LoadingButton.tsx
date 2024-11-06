import { useState, useEffect } from 'react';
import { ClipLoader } from 'react-spinners';

interface LoadingButtonProps {
  className?: string;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({ className }) => {
  const loadingMessages = [
    '✨ Sprinkling creative pixie dust...',
    '🧙‍♂️ Consulting our AI wizards...',
    '🎨 Painting with digital inspiration...',
    '🌟 Brewing your creative potion...',
    '🧩 Assembling imagination pieces...',
    '🔮 Reading the neural crystal ball...',
    "🎭 Directing your prompt's story...",
    '🎪 Juggling creative possibilities...',
    '🌈 Weaving creative rainbows...',
    '🎯 Fine-tuning the magic...',
  ] as const;

  const [currentMessage, setCurrentMessage] = useState<string>(
    loadingMessages[0]
  );

  useEffect(() => {
    let messageIndex = 0;
    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[messageIndex]);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <button className={className}>
        <ClipLoader color="#f0f0f0" size={20} />
      </button>
      <p className="text-sm text-gray-400 animate-pulse">{currentMessage}</p>
    </div>
  );
};

export default LoadingButton;

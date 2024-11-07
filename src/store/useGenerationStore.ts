import { create } from 'zustand';

interface PromptState {
  selectedChain: {
    name: string;
    img: string;
  };
  selectedModel: {
    name: string;
  };
  setSelectedChain: (chain: { name: string; img: string }) => void;
  setSelectedModel: (model: { name: string }) => void;
}

export const useGenerationStore = create<PromptState>((set) => ({
  selectedChain: {
    name: 'Base Sepolia',
    img: 'https://moonpay-marketing-c337344.payloadcms.app/media/base%20logo.webp',
  },
  selectedModel: {
    name: 'Stable Image Ultra',
  },

  setSelectedChain: (chain) => set({ selectedChain: chain }),
  setSelectedModel: (model) => set({ selectedModel: model }),
}));

import { create } from 'zustand';

interface AAStore {
  isAADisabled: boolean;
  toggleAA: () => void;
}

export const useAAStore = create<AAStore>((set) => ({
  isAADisabled: false,
  toggleAA: () => set((state) => ({ isAADisabled: !state.isAADisabled })),
}));

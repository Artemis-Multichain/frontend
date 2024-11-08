import { create } from 'zustand';

interface AllocationModalState {
  isOpen: boolean;
  modalData: {
    image?: string;
    name?: string;
    price?: string;
    prompt?: string;
    creator?: string;
    cid?: string;
    ai_model?: string;
    chainName?: string;
    maxSupply?: number;
  } | null;
  openModal: (data?: AllocationModalState['modalData']) => void;
  closeModal: () => void;
}

export const useAllocationModal = create<AllocationModalState>((set) => ({
  isOpen: false,
  modalData: null,
  openModal: (data = null) => set({ isOpen: true, modalData: data }),
  closeModal: () => set({ isOpen: false, modalData: null }),
}));

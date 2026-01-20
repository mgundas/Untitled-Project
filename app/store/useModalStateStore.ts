import { create } from "zustand";

interface ActiveModalState {
  activeModal: string | null;
  data: any; // Useful for passing props to the modal
  open: (id: string, data?: any) => void;
  close: () => void;
}

export const useModal = create<ActiveModalState>((set) => ({
  activeModal: null,
  data: null,
  open: (id, data = null) => set({ activeModal: id, data }),
  close: () => set({ activeModal: null, data: null }),
}));

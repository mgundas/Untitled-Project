import { create } from "zustand";

interface ModalState {
  modals: {
    id: string | null;
    isOpen: boolean;
  }[];
  setOpen: (id: string, status: boolean) => void;
}

export const useModalStateStore = create<ModalState>((set) => ({
  modals: [
    {
      id: "settings",
      isOpen: false,
    },
    {
      id: "logs",
      isOpen: false,
    },
  ],
  setOpen: (id: string, status: boolean) =>
    set((state) => ({
      modals: state.modals.map((modal) =>
        modal.id === id ? { ...modal, isOpen: status } : modal
      ),
    })),
}));

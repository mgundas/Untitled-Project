import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  setOpen: (status:boolean) => void
}

export const useModalStateStore = create<ModalState>((set) => ({
  isOpen: false,
  setOpen: (status:boolean) => set(() => ({ isOpen: status })),
}))
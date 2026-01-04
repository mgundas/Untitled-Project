import { create } from 'zustand'

// 1. Define the shape of your state
interface ModalState {
  isOpen: boolean
  setOpen: (status:boolean) => void
}

// 2. Create the store
export const useModalStateStore = create<ModalState>((set) => ({
  isOpen: false, // Initial state
  
  // Actions to update the state
  setOpen: (status:boolean) => set((state) => ({ isOpen: status})),
}))
"use client";
// ModalManager.tsx
import { useModal } from "../store/useModalStateStore";
import SettingsModal from "./SettingsModal";

export const ModalManager = () => {
  const { activeModal, data, close } = useModal();

  if (!activeModal) return null;

  // Decide which modal to show
  switch (activeModal) {
    case "settings":
      return <SettingsModal isOpen={true} onClose={close} />;
    default:
      return null;
  }
};
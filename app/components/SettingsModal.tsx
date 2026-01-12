"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useModalStateStore } from "../store/useModalStateStore";

const SettingsModal = () => {
  const isOpen = useModalStateStore((state) => state.modals.find(modal => modal.id === "settings")?.isOpen);
  const setModalOpen = useModalStateStore((state) => state.setOpen);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setModalOpen("settings", open)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <DialogDescription></DialogDescription>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;

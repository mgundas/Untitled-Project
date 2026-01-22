"use client";

import { usePostStore } from "@/app/store/usePostStore";
import { Button } from "@/components/ui/button";
import { PenSquare } from "lucide-react";

export function PostComposerButton() {
  const { openComposer } = usePostStore();

  return (
    <Button
      onClick={() => openComposer("create")}
      size="lg"
      className="fixed bottom-6 right-6 rounded-full shadow-lg h-14 w-14 p-0"
    >
      <PenSquare className="h-6 w-6" />
    </Button>
  );
}

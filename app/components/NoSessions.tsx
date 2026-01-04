'use client'; // This tells Next.js this is a Client Component

import { Button } from "@/components/ui/button";
import { useModalStateStore } from "../store/useModalStateStore";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Droplet } from "lucide-react";

export function NoSessions() {
  const setOpen = useModalStateStore((state) => state.setOpen);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Droplet />
        </EmptyMedia>
        <EmptyTitle>No Sessions Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any sessions yet. Get started by
          creating your first session.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Create Session</Button>
        </div>
      </EmptyContent>
    </Empty>
  );
}
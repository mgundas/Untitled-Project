"use client";

import { Repeat2 } from "lucide-react";

export function RepostIndicator({ authorName }: { authorName: string | null }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-2 text-xs text-muted-foreground">
      <Repeat2 className="h-3 w-3" />
      <span>{authorName || "Someone"} reposted</span>
    </div>
  );
}

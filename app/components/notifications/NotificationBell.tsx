"use client";

import { useUnreadCount } from "@/hooks/useNotifications";
import { Bell } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { data } = useUnreadCount();
  const unreadCount = data?.count || 0;

  return (
    <Link
      href="/notifications"
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

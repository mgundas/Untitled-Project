"use client";

import { useNotifications, useMarkAllAsRead } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export function NotificationsList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useNotifications();
  const markAllAsRead = useMarkAllAsRead();
  const { ref, inView } = useInView({ threshold: 0 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 space-y-3 flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const notifications = data?.pages.flatMap((page) => page.notifications) ?? [];
  const hasUnread = notifications.some((n) => !n.read);

  // Empty state
  if (notifications.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto p-12 text-center">
        <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
        <p className="text-muted-foreground">
          When someone likes, comments, or reposts your posts, you'll see it here
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {hasUnread && (
        <div className="sticky top-0 z-10 bg-background border-b p-4 flex justify-between items-center">
          <h2 className="font-semibold">Notifications</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        </div>
      )}

      <div className="divide-y">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="py-4 text-center text-muted-foreground">
          {isFetchingNextPage && "Loading..."}
        </div>
      )}
    </div>
  );
}

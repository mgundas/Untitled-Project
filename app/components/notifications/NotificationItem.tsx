"use client";

import { Notification, useMarkAsRead } from "@/hooks/useNotifications";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Heart, Repeat2, MessageCircle, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const markAsRead = useMarkAsRead();
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleClick = () => {
    if (!notification.read) {
      markAsRead.mutate(notification.id);
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "repost":
        return <Repeat2 className="h-4 w-4 text-green-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-purple-500" />;
    }
  };

  const getNotificationText = () => {
    const actorName = notification.actor.fullName || "Someone";
    switch (notification.type) {
      case "like":
        return `${actorName} liked your post`;
      case "repost":
        return `${actorName} reposted your post`;
      case "comment":
        return `${actorName} commented on your post`;
      case "follow":
        return `${actorName} started following you`;
    }
  };

  const getNotificationLink = () => {
    switch (notification.type) {
      case "like":
      case "repost":
      case "comment":
        return notification.postId ? `/post/${notification.postId}` : "#";
      case "follow":
        return `/profile/${notification.actorId}`;
      default:
        return "#";
    }
  };

  return (
    <Link
      href={getNotificationLink()}
      onClick={handleClick}
      className={cn(
        "flex gap-3 p-4 hover:bg-accent/50 transition-colors border-b",
        !notification.read && "bg-accent/20"
      )}
    >
      <div className="flex-shrink-0">{getNotificationIcon()}</div>

      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={notification.actor.avatarUrl || undefined} />
        <AvatarFallback>
          {notification.actor.fullName?.charAt(0).toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className="text-sm">
            <span className="font-semibold">{notification.actor.fullName || "Anonymous"}</span>
            <span className="text-muted-foreground ml-1">
              {notification.type === "like" && "liked your post"}
              {notification.type === "repost" && "reposted your post"}
              {notification.type === "comment" && "commented on your post"}
              {notification.type === "follow" && "started following you"}
            </span>
          </p>
        </div>

        {notification.post && notification.type !== "follow" && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.post.content}
          </p>
        )}

        {notification.comment && notification.type === "comment" && (
          <p className="text-sm mt-1 line-clamp-2 italic">
            "{notification.comment.content}"
          </p>
        )}

        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>

      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </Link>
  );
}

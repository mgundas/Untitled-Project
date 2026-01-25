import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

export interface Notification {
  id: string;
  userId: string;
  actorId: string;
  type: "like" | "repost" | "comment" | "follow";
  postId: string | null;
  commentId: string | null;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  post?: {
    id: string;
    content: string;
  } | null;
  comment?: {
    id: string;
    content: string;
  } | null;
}

interface NotificationsResponse {
  notifications: Notification[];
  nextCursor: string | null;
  hasMore: boolean;
}

export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

// Get notifications with infinite scroll
export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.lists(),
    queryFn: ({ pageParam }) =>
      apiClient<NotificationsResponse>(`/notifications?cursor=${pageParam || ""}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get unread count
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => apiClient<{ count: number }>("/notifications/unread-count"),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Mark notification as read
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) =>
      apiClient<{ success: boolean }>(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      }),

    onMutate: async (notificationId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot previous values
      const previousData = {
        lists: queryClient.getQueryData(notificationKeys.lists()),
        unreadCount: queryClient.getQueryData(notificationKeys.unreadCount()),
      };

      // Optimistically update notification to read
      queryClient.setQueryData<any>(notificationKeys.lists(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((notification: Notification) =>
              notification.id === notificationId
                ? { ...notification, read: true }
                : notification
            ),
          })),
        };
      });

      // Decrement unread count
      queryClient.setQueryData<{ count: number }>(notificationKeys.unreadCount(), (old: any) => {
        if (!old) return old;
        return { count: Math.max(0, old.count - 1) };
      });

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.lists(), context.previousData.lists);
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousData.unreadCount);
      }
    },
  });
}

// Mark all notifications as read
export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient<{ success: boolean }>("/notifications/mark-all-read", {
        method: "PATCH",
      }),

    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });

      // Snapshot previous values
      const previousData = {
        lists: queryClient.getQueryData(notificationKeys.lists()),
        unreadCount: queryClient.getQueryData(notificationKeys.unreadCount()),
      };

      // Optimistically mark all notifications as read
      queryClient.setQueryData<any>(notificationKeys.lists(), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            notifications: page.notifications.map((notification: Notification) => ({
              ...notification,
              read: true,
            })),
          })),
        };
      });

      // Set unread count to 0
      queryClient.setQueryData<{ count: number }>(notificationKeys.unreadCount(), { count: 0 });

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(notificationKeys.lists(), context.previousData.lists);
        queryClient.setQueryData(notificationKeys.unreadCount(), context.previousData.unreadCount);
      }
      toast.error("Failed to mark all as read");
    },

    onSuccess: () => {
      toast.success("All notifications marked as read");
    },
  });
}

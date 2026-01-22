import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { usePostStore, Post } from "@/app/store/usePostStore";
import { toast } from "sonner";

export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: (postId: string) => [...postKeys.detail(postId), "comments"] as const,
  userPosts: (userId: string) => [...postKeys.all, "user", userId] as const,
};

interface PostsResponse {
  posts: Post[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function usePostsFeed() {
  return useInfiniteQuery({
    queryKey: postKeys.list("feed"),
    queryFn: ({ pageParam = null }) =>
      apiClient<PostsResponse>(`/posts?cursor=${pageParam || ""}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null,
    staleTime: 30 * 1000,
  });
}

export function useUserPosts(userId: string) {
  return useQuery({
    queryKey: postKeys.userPosts(userId),
    queryFn: () => apiClient<{ posts: Post[] }>(`/users/${userId}/posts`),
    enabled: !!userId,
  });
}

export function usePostComments(postId: string) {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => apiClient<any[]>(`/posts/${postId}/comments`),
    enabled: !!postId,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const { closeComposer } = usePostStore();

  return useMutation({
    mutationFn: (data: { content: string; isComment?: boolean; postId?: string }) =>
      apiClient<Post>("/posts", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      closeComposer();
      toast.success("Posted!");
    },
    onError: () => toast.error("Failed to post"),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const { toggleOptimisticLike, clearOptimistic } = usePostStore();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      apiClient<{ success: boolean }>(`/posts/${postId}/like`, {
        method: isLiked ? "POST" : "DELETE",
      }),

    onMutate: async ({ postId, isLiked }) => {
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      const previousPosts = queryClient.getQueryData(postKeys.list("feed"));

      queryClient.setQueriesData<any>({ queryKey: postKeys.lists() }, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: Post) =>
              post.id === postId
                ? { ...post, isLikedByCurrentUser: isLiked, likesCount: post.likesCount + (isLiked ? 1 : -1) }
                : post
            ),
          })),
        };
      });

      toggleOptimisticLike(postId, isLiked);
      return { previousPosts };
    },

    onError: (err, { postId }, context) => {
      queryClient.setQueryData(postKeys.list("feed"), context?.previousPosts);
      toast.error("Failed to like");
      clearOptimistic(postId);
    },

    onSettled: (data, error, { postId }) => clearOptimistic(postId),
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();
  const { toggleOptimisticRepost, clearOptimistic } = usePostStore();

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      apiClient<{ success: boolean; isReposted: boolean }>(`/posts/${postId}/repost`, { method: "POST" }),

    onMutate: async ({ postId }) => {
      toggleOptimisticRepost(postId);
    },

    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success(data.isReposted ? "Reposted!" : "Repost removed");
    },

    onError: (err, { postId }) => {
      toast.error("Failed to repost");
      clearOptimistic(postId);
    },

    onSettled: (data, error, { postId }) => clearOptimistic(postId),
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient(`/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      toast.success("Deleted");
    },
    onError: () => toast.error("Failed to delete"),
  });
}

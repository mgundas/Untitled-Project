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
    queryFn: ({ pageParam }) =>
      apiClient<PostsResponse>(`/posts?cursor=${pageParam || ""}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
    staleTime: 30 * 1000,
    structuralSharing: false, // Disable structural sharing to ensure updates trigger re-renders
  });
}

export function useFollowingFeed() {
  return useInfiniteQuery({
    queryKey: postKeys.list("following"),
    queryFn: ({ pageParam }) =>
      apiClient<PostsResponse>(`/posts/following?cursor=${pageParam || ""}`),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: null as string | null,
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

export function usePost(postId: string) {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => apiClient<Post>(`/posts/${postId}`),
    enabled: !!postId,
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      if (variables.isComment && variables.postId) {
        queryClient.invalidateQueries({ queryKey: postKeys.comments(variables.postId) });
      }
      closeComposer();
      toast.success(variables.isComment ? "Comment added!" : "Posted!");
    },
    onError: () => toast.error("Failed to post"),
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, isLiked }: { postId: string; isLiked: boolean }) =>
      apiClient<{ success: boolean }>(`/posts/${postId}/like`, {
        method: isLiked ? "POST" : "DELETE",
      }),

    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      // Snapshot previous values
      const previousData = {
        feed: queryClient.getQueryData(postKeys.list("feed")),
        following: queryClient.getQueryData(postKeys.list("following")),
        userPosts: queryClient.getQueriesData({ queryKey: [...postKeys.all, "user"] }),
        bookmarks: queryClient.getQueryData([...postKeys.all, "bookmarks"]),
        detail: queryClient.getQueryData(postKeys.detail(postId)),
      };

      const updatePost = (post: Post): Post => {
        // Update the post if it matches
        if (post.id === postId) {
          return {
            ...post,
            isLikedByCurrentUser: isLiked,
            likesCount: post.likesCount + (isLiked ? 1 : -1)
          };
        }

        // Also update the originalPost if this is a repost and the original matches
        if (post.isRepost && post.originalPost && post.originalPost.id === postId) {
          return {
            ...post,
            originalPost: {
              ...post.originalPost,
              isLikedByCurrentUser: isLiked,
              likesCount: post.originalPost.likesCount + (isLiked ? 1 : -1)
            }
          };
        }

        return post;
      };

      // Update For You feed
      queryClient.setQueryData<any>(postKeys.list("feed"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update Following feed
      queryClient.setQueryData<any>(postKeys.list("following"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update user posts queries
      queryClient.setQueriesData<any>({ queryKey: [...postKeys.all, "user"] }, (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update bookmarks
      queryClient.setQueryData<any>([...postKeys.all, "bookmarks"], (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update single post detail query
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isLikedByCurrentUser: isLiked,
          likesCount: old.likesCount + (isLiked ? 1 : -1),
        };
      });

      return { previousData };
    },

    onError: (_err, _variables, context) => {
      // Rollback to previous values on error
      if (context?.previousData) {
        if (context.previousData.feed) {
          queryClient.setQueryData(postKeys.list("feed"), context.previousData.feed);
        }
        if (context.previousData.following) {
          queryClient.setQueryData(postKeys.list("following"), context.previousData.following);
        }
        if (context.previousData.bookmarks) {
          queryClient.setQueryData([...postKeys.all, "bookmarks"], context.previousData.bookmarks);
        }
        context.previousData.userPosts.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (context.previousData.detail) {
          queryClient.setQueryData(postKeys.detail(_variables.postId), context.previousData.detail);
        }
      }
      toast.error("Failed to update like");
    },

    onSuccess: () => {
      // Don't show success toast for likes - it's too noisy
    },
  });
}

export function useToggleRepost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      apiClient<{ success: boolean; isReposted: boolean }>(`/posts/${postId}/repost`, { method: "POST" }),

    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      // Snapshot previous values
      const previousData = {
        feed: queryClient.getQueryData(postKeys.list("feed")),
        following: queryClient.getQueryData(postKeys.list("following")),
        userPosts: queryClient.getQueriesData({ queryKey: [...postKeys.all, "user"] }),
        bookmarks: queryClient.getQueryData([...postKeys.all, "bookmarks"]),
        detail: queryClient.getQueryData(postKeys.detail(postId)),
      };

      // Get current repost state to toggle it
      let currentIsReposted = false;
      const currentData = queryClient.getQueryData<any>(postKeys.list("feed"));
      if (currentData?.pages) {
        for (const page of currentData.pages) {
          const post = page.posts.find((p: Post) => p.id === postId);
          if (post) {
            currentIsReposted = post.isRepostedByCurrentUser || false;
            break;
          }
        }
      }

      const newIsReposted = !currentIsReposted;

      const updatePost = (post: Post): Post => {
        // Update the post if it matches
        if (post.id === postId) {
          return {
            ...post,
            isRepostedByCurrentUser: newIsReposted,
            repostsCount: post.repostsCount + (newIsReposted ? 1 : -1)
          };
        }

        // Also update the originalPost if this is a repost and the original matches
        if (post.isRepost && post.originalPost && post.originalPost.id === postId) {
          return {
            ...post,
            originalPost: {
              ...post.originalPost,
              isRepostedByCurrentUser: newIsReposted,
              repostsCount: post.originalPost.repostsCount + (newIsReposted ? 1 : -1)
            }
          };
        }

        return post;
      };

      // Update For You feed
      queryClient.setQueryData<any>(postKeys.list("feed"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update Following feed
      queryClient.setQueryData<any>(postKeys.list("following"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update user posts queries
      queryClient.setQueriesData<any>({ queryKey: [...postKeys.all, "user"] }, (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update bookmarks
      queryClient.setQueryData<any>([...postKeys.all, "bookmarks"], (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update single post detail query
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return {
          ...old,
          isRepostedByCurrentUser: newIsReposted,
          repostsCount: old.repostsCount + (newIsReposted ? 1 : -1),
        };
      });

      return { previousData, newIsReposted };
    },

    onError: (_err, _variables, context) => {
      // Rollback to previous values on error
      if (context?.previousData) {
        if (context.previousData.feed) {
          queryClient.setQueryData(postKeys.list("feed"), context.previousData.feed);
        }
        if (context.previousData.following) {
          queryClient.setQueryData(postKeys.list("following"), context.previousData.following);
        }
        if (context.previousData.bookmarks) {
          queryClient.setQueryData([...postKeys.all, "bookmarks"], context.previousData.bookmarks);
        }
        context.previousData.userPosts.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (context.previousData.detail) {
          queryClient.setQueryData(postKeys.detail(_variables.postId), context.previousData.detail);
        }
      }
      toast.error("Failed to repost");
    },

    onSuccess: (data, _variables, context) => {
      // Invalidate to refetch the new repost in the feed
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success(data.isReposted ? "Reposted!" : "Repost removed");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => apiClient(`/posts/${postId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all });
      toast.success("Post deleted");
    },
    onError: () => toast.error("Failed to delete post"),
  });
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      apiClient<{ success: boolean; isBookmarked: boolean }>(`/posts/${postId}/bookmark`, { method: "POST" }),

    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.all });

      // Snapshot previous values
      const previousData = {
        feed: queryClient.getQueryData(postKeys.list("feed")),
        following: queryClient.getQueryData(postKeys.list("following")),
        userPosts: queryClient.getQueriesData({ queryKey: [...postKeys.all, "user"] }),
        bookmarks: queryClient.getQueryData([...postKeys.all, "bookmarks"]),
        detail: queryClient.getQueryData(postKeys.detail(postId)),
      };

      // Get current bookmark state to toggle it
      let currentIsBookmarked = false;
      const currentData = queryClient.getQueryData<any>(postKeys.list("feed"));
      if (currentData?.pages) {
        for (const page of currentData.pages) {
          const post = page.posts.find((p: Post) => p.id === postId);
          if (post) {
            currentIsBookmarked = post.isBookmarkedByCurrentUser || false;
            break;
          }
        }
      }

      const newIsBookmarked = !currentIsBookmarked;

      const updatePost = (post: Post): Post => {
        // Update the post if it matches
        if (post.id === postId) {
          return { ...post, isBookmarkedByCurrentUser: newIsBookmarked };
        }

        // Also update the originalPost if this is a repost and the original matches
        if (post.isRepost && post.originalPost && post.originalPost.id === postId) {
          return {
            ...post,
            originalPost: {
              ...post.originalPost,
              isBookmarkedByCurrentUser: newIsBookmarked
            }
          };
        }

        return post;
      };

      // Update For You feed
      queryClient.setQueryData<any>(postKeys.list("feed"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update Following feed
      queryClient.setQueryData<any>(postKeys.list("following"), (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map(updatePost),
          })),
        };
      });

      // Update user posts queries
      queryClient.setQueriesData<any>({ queryKey: [...postKeys.all, "user"] }, (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update bookmarks
      queryClient.setQueryData<any>([...postKeys.all, "bookmarks"], (old: any) => {
        if (!old?.posts) return old;
        return {
          ...old,
          posts: old.posts.map(updatePost),
        };
      });

      // Update single post detail query
      queryClient.setQueryData<Post>(postKeys.detail(postId), (old: any) => {
        if (!old) return old;
        return { ...old, isBookmarkedByCurrentUser: newIsBookmarked };
      });

      return { previousData, newIsBookmarked };
    },

    onError: (_err, _variables, context) => {
      // Rollback to previous values on error
      if (context?.previousData) {
        if (context.previousData.feed) {
          queryClient.setQueryData(postKeys.list("feed"), context.previousData.feed);
        }
        if (context.previousData.following) {
          queryClient.setQueryData(postKeys.list("following"), context.previousData.following);
        }
        if (context.previousData.bookmarks) {
          queryClient.setQueryData([...postKeys.all, "bookmarks"], context.previousData.bookmarks);
        }
        context.previousData.userPosts.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
        if (context.previousData.detail) {
          queryClient.setQueryData(postKeys.detail(_variables.postId), context.previousData.detail);
        }
      }
      toast.error("Failed to update bookmark");
    },

    onSuccess: (_data, _variables, context) => {
      // Show success message based on the optimistic state
      toast.success(context?.newIsBookmarked ? "Bookmarked!" : "Bookmark removed");
    },
  });
}

export function useBookmarks() {
  return useQuery({
    queryKey: [...postKeys.all, "bookmarks"],
    queryFn: () => apiClient<{ posts: Post[] }>("/bookmarks"),
  });
}

export function useToggleFollow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId }: { userId: string }) =>
      apiClient<{ success: boolean; isFollowing: boolean }>(`/users/${userId}/follow`, { method: "POST" }),

    onSuccess: (data, { userId }) => {
      // Only invalidate following feed to show new posts from followed user
      // Don't invalidate user posts or other feeds to avoid flickering
      queryClient.invalidateQueries({ queryKey: postKeys.list("following") });
      toast.success(data.isFollowing ? "Following!" : "Unfollowed");
    },

    onError: () => toast.error("Failed to follow"),
  });
}

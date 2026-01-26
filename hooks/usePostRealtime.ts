import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";
import { Post } from "@/app/store/usePostStore";
import { postKeys } from "./usePosts";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

interface PostUpdateEvent {
  type: "LIKE" | "UNLIKE" | "REPOST" | "UNREPOST" | "BOOKMARK" | "UNBOOKMARK" | "DELETE" | "CREATE" | "COMMENT";
  postId: string;
  userId: string;
  // Shared state that should be broadcast
  likesCount?: number;
  repostsCount?: number;
  commentsCount?: number;
  newPost?: Post;
  // NOTE: Personal state (isLikedByCurrentUser, etc.) should NOT be broadcast
  // Each user manages their own personal state through optimistic updates
}

// Global Supabase client (singleton) - shared across the entire app
let globalSupabaseClient: SupabaseClient | null = null;
let globalChannel: RealtimeChannel | null = null;
let subscriberCount = 0;

function getGlobalSupabaseClient(): SupabaseClient {
  if (!globalSupabaseClient) {
    globalSupabaseClient = createClient();
    console.log("[Realtime] Created global Supabase client");
  }
  return globalSupabaseClient;
}

export function usePostRealtime(enabled = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    subscriberCount++;
    console.log(`[Realtime] Subscriber count: ${subscriberCount}`);

    // Create or reuse the global channel
    if (!globalChannel) {
      const supabase = getGlobalSupabaseClient();

      globalChannel = supabase
        .channel("posts-realtime-broadcast", {
          config: {
            broadcast: { self: true }, // Allow receiving own broadcasts (useful for testing)
          },
        })
        .on("broadcast", { event: "post-update" }, ({ payload }: { payload: PostUpdateEvent }) => {
          console.log("[Realtime] 🔔 Received broadcast:", payload);

          const updatePost = (post: Post): Post => {
            // Handle DELETE event
            if (payload.type === "DELETE" && post.id === payload.postId) {
              return null as any; // Will be filtered out
            }

            // Update the post if it matches - ONLY UPDATE COUNTS, NOT PERSONAL STATE
            if (post.id === payload.postId) {
              return {
                ...post,
                likesCount: payload.likesCount ?? post.likesCount,
                repostsCount: payload.repostsCount ?? post.repostsCount,
                commentsCount: payload.commentsCount ?? post.commentsCount,
                // Keep personal state unchanged - it's user-specific
              };
            }

            // Also update originalPost if this is a repost
            if (post.isRepost && post.originalPost && post.originalPost.id === payload.postId) {
              return {
                ...post,
                originalPost: {
                  ...post.originalPost,
                  likesCount: payload.likesCount ?? post.originalPost.likesCount,
                  repostsCount: payload.repostsCount ?? post.originalPost.repostsCount,
                  commentsCount: payload.commentsCount ?? post.originalPost.commentsCount,
                  // Keep personal state unchanged - it's user-specific
                },
              };
            }

            return post;
          };

          // Update all feed queries (For You, Following)
          queryClient.setQueriesData<any>(
            { queryKey: postKeys.lists() },
            (oldData: any) => {
              if (!oldData?.pages) return oldData;

              return {
                ...oldData,
                pages: oldData.pages.map((page: any) => ({
                  ...page,
                  posts: page.posts.map(updatePost).filter(Boolean), // Remove null entries (deleted posts)
                })),
              };
            }
          );

          // Update user posts queries
          queryClient.setQueriesData<any>(
            { queryKey: [...postKeys.all, "user"] },
            (oldData: any) => {
              if (!oldData?.posts) return oldData;

              return {
                ...oldData,
                posts: oldData.posts.map(updatePost).filter(Boolean),
              };
            }
          );

          // Update bookmarks
          queryClient.setQueryData<any>([...postKeys.all, "bookmarks"], (oldData: any) => {
            if (!oldData?.posts) return oldData;

            return {
              ...oldData,
              posts: oldData.posts.map(updatePost).filter(Boolean),
            };
          });

          // Handle CREATE event - add new post to feed
          if (payload.type === "CREATE" && payload.newPost) {
            queryClient.setQueriesData<any>(
              { queryKey: postKeys.lists() },
              (oldData: any) => {
                if (!oldData?.pages) return oldData;

                // Add new post to the first page
                const updatedPages = [...oldData.pages];
                if (updatedPages.length > 0) {
                  updatedPages[0] = {
                    ...updatedPages[0],
                    posts: [payload.newPost, ...updatedPages[0].posts],
                  };
                }

                return {
                  ...oldData,
                  pages: updatedPages,
                };
              }
            );
          }
        });

      globalChannel.subscribe((status) => {
        console.log("[Realtime] 📡 Channel status:", status);
      });

      console.log("[Realtime] ✅ Created and subscribed to global channel");
    } else {
      console.log("[Realtime] ♻️ Reusing existing global channel");
    }

    return () => {
      subscriberCount--;
      console.log(`[Realtime] Subscriber count: ${subscriberCount}`);

      // Only clean up when no more subscribers
      if (subscriberCount === 0 && globalChannel) {
        console.log("[Realtime] 🧹 Last subscriber, cleaning up channel");
        const supabase = getGlobalSupabaseClient();
        supabase.removeChannel(globalChannel);
        globalChannel = null;
      }
    };
  }, [enabled, queryClient]);
}

// Helper function to broadcast post updates
export async function broadcastPostUpdate(event: PostUpdateEvent) {
  try {
    console.log("[Realtime] 📤 Broadcasting event:", event);

    // Ensure we have a channel (create if needed)
    if (!globalChannel) {
      const supabase = getGlobalSupabaseClient();
      globalChannel = supabase.channel("posts-realtime-broadcast", {
        config: {
          broadcast: { self: true },
        },
      });

      // Wait for subscription
      await new Promise<void>((resolve, reject) => {
        globalChannel!.subscribe((status) => {
          console.log("[Realtime] Broadcast channel status:", status);
          if (status === "SUBSCRIBED") {
            resolve();
          } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            reject(new Error(`Failed to subscribe: ${status}`));
          }
        });
      });

      console.log("[Realtime] ✅ Broadcast channel ready");
    }

    const result = await globalChannel.send({
      type: "broadcast",
      event: "post-update",
      payload: event,
    });

    console.log("[Realtime] 📡 Broadcast result:", result);

    if (result !== "ok") {
      console.error("[Realtime] ❌ Failed to send:", result);
    }
  } catch (error) {
    console.error("[Realtime] ❌ Error broadcasting:", error);
  }
}

"use client";

import { useUserPosts } from "@/hooks/usePosts";
import { PostCard } from "./PostCard";
import { usePostRealtime } from "@/hooks/usePostRealtime";

export function UserPostFeed({ userId }: { userId: string }) {
  const { data, isLoading } = useUserPosts(userId);

  // Subscribe to realtime updates
  usePostRealtime();

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return <div className="p-4 text-center text-muted-foreground">No posts yet</div>;
  }

  return (
    <div className="divide-y">
      {posts.map((post) => (
        <PostCard key={`${post.id}-${post.isLikedByCurrentUser}-${post.likesCount}`} post={post} />
      ))}
    </div>
  );
}

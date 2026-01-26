"use client";

import { usePostsFeed } from "@/hooks/usePosts";
import { PostCard } from "./PostCard";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePostRealtime } from "@/hooks/usePostRealtime";

export function PostFeed() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = usePostsFeed();
  const { ref, inView } = useInView({ threshold: 0 });

  // Subscribe to realtime updates
  usePostRealtime();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 space-y-3">
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const posts = data?.pages.flatMap((page) => page.posts) ?? [];

  return (
    <div className="w-full max-w-2xl mx-auto divide-y">
      {posts.map((post) => (
        <PostCard key={`${post.id}-${post.isLikedByCurrentUser}-${post.likesCount}`} post={post} />
      ))}
      {hasNextPage && (
        <div ref={ref} className="py-4 text-center text-muted-foreground">
          {isFetchingNextPage && "Loading..."}
        </div>
      )}
    </div>
  );
}

"use client";

import { useBookmarks } from "@/hooks/usePosts";
import { PostCard } from "@/app/components/posts/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const { data, isLoading } = useBookmarks();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Bookmarks</h1>
          <p className="text-muted-foreground text-sm">Posts you've saved</p>
        </div>
        <div className="space-y-4">
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
      </div>
    );
  }

  const posts = data?.posts ?? [];

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-6 border-b sticky top-0 bg-background z-10">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            Bookmarks
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts.length} saved {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground">
              Save posts to read them later. Click the bookmark icon on any post.
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

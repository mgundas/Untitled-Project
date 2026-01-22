"use client";

import { Post, usePostStore } from "@/app/store/usePostStore";
import { useToggleLike, useToggleRepost } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PostActions({ post }: { post: Post }) {
  const { openComposer } = usePostStore();
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();

  const handleLike = () => {
    toggleLike.mutate({
      postId: post.id,
      isLiked: !post.isLikedByCurrentUser,
    });
  };

  const handleRepost = () => {
    toggleRepost.mutate({ postId: post.id });
  };

  const handleComment = () => {
    openComposer("comment", post.id);
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleComment}
        className="gap-2 text-muted-foreground hover:text-blue-500"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs">Comment</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleRepost}
        className={cn(
          "gap-2 text-muted-foreground hover:text-green-500",
          post.isRepostedByCurrentUser && "text-green-500"
        )}
      >
        <Repeat2 className="h-4 w-4" />
        <span className="text-xs">Repost</span>
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        className={cn(
          "gap-2 text-muted-foreground hover:text-red-500",
          post.isLikedByCurrentUser && "text-red-500"
        )}
      >
        <Heart className={cn("h-4 w-4", post.isLikedByCurrentUser && "fill-current")} />
        <span className="text-xs">Like</span>
      </Button>
    </div>
  );
}

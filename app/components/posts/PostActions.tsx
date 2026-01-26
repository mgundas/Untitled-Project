"use client";

import { Post, usePostStore } from "@/app/store/usePostStore";
import { useToggleLike, useToggleRepost, useDeletePost, useToggleBookmark } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Repeat2, Trash2, MoreHorizontal, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PostActions({ post }: { post: Post }) {
  const { openComposer } = usePostStore();
  const toggleLike = useToggleLike();
  const toggleRepost = useToggleRepost();
  const toggleBookmark = useToggleBookmark();
  const deletePost = useDeletePost();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setCurrentUserId(data.id);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleLike.mutate({
      postId: post.id,
      isLiked: !post.isLikedByCurrentUser,
    });
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleRepost.mutate({ postId: post.id });
  };

  const handleComment = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    openComposer("comment", post.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleBookmark.mutate({ postId: post.id });
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this post?")) {
      deletePost.mutate(post.id);
    }
  };

  const isOwnPost = currentUserId === post.authorId;

  return (
    <div className="flex items-center justify-between mt-3">
      <div className="flex gap-2">
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

        <Button
          variant="ghost"
          size="sm"
          onClick={handleBookmark}
          className={cn(
            "gap-2 text-muted-foreground hover:text-yellow-500",
            post.isBookmarkedByCurrentUser && "text-yellow-500"
          )}
        >
          <Bookmark className={cn("h-4 w-4", post.isBookmarkedByCurrentUser && "fill-current")} />
          <span className="text-xs">Save</span>
        </Button>
      </div>

      {isOwnPost && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

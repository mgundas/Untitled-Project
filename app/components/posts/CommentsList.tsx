"use client";

import { usePostComments } from "@/hooks/usePosts";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

export function CommentsList({ postId }: { postId: string }) {
  const { data: comments, isLoading } = usePostComments(postId);

  if (isLoading) {
    return (
      <div className="divide-y">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="p-4 flex gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No comments yet. Be the first to comment!
      </div>
    );
  }

  return (
    <div className="divide-y">
      {comments.map((comment) => {
        const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true });

        return (
          <div key={comment.id} className="p-4 hover:bg-accent/50 transition-colors">
            <div className="flex gap-3">
              <Link href={`/profile/${comment.authorId}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatarUrl || undefined} />
                  <AvatarFallback>
                    {comment.author.fullName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link href={`/profile/${comment.authorId}`} className="font-semibold hover:underline text-sm">
                    {comment.author.fullName || "Anonymous"}
                  </Link>
                  <span className="text-xs text-muted-foreground">{timeAgo}</span>
                </div>

                <div className="mt-1 text-sm whitespace-pre-wrap break-words">
                  {comment.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

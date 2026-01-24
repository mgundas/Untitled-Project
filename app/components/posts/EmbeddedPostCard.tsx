"use client";

import { Post } from "@/app/store/usePostStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function EmbeddedPostCard({ post }: { post: Post }) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div className="border rounded-lg p-3 mt-2 hover:bg-accent/30 transition-colors">
      <Link href={`/post/${post.id}`} className="block">
        <div className="flex gap-2">
          <Link href={`/profile/${post.authorId}`} onClick={(e) => e.stopPropagation()}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={post.author.avatarUrl || undefined} />
              <AvatarFallback>
                {post.author.fullName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <Link
                href={`/profile/${post.authorId}`}
                className="font-semibold hover:underline text-sm"
                onClick={(e) => e.stopPropagation()}
              >
                {post.author.fullName || "Anonymous"}
              </Link>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <div className="mt-1 text-sm whitespace-pre-wrap break-words">
              {post.content}
            </div>

            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{post.commentsCount} comments</span>
              <span>{post.repostsCount} reposts</span>
              <span>{post.likesCount} likes</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

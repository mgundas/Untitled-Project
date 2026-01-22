"use client";

import { Post } from "@/app/store/usePostStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostActions } from "./PostActions";
import { RepostIndicator } from "./RepostIndicator";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export function PostCard({ post }: { post: Post }) {
  const displayPost = post.isRepost && post.originalPost ? post.originalPost : post;
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  return (
    <div className="hover:bg-accent/50 transition-colors">
      {post.isRepost && post.originalPost && (
        <RepostIndicator authorName={post.author.fullName} />
      )}

      <div className="p-4">
        <div className="flex gap-3">
          <Link href={`/profile/${displayPost.authorId}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={displayPost.author.avatarUrl || undefined} />
              <AvatarFallback>
                {displayPost.author.fullName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <Link href={`/profile/${displayPost.authorId}`} className="font-semibold hover:underline">
                {displayPost.author.fullName || "Anonymous"}
              </Link>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <div className="mt-1 text-sm whitespace-pre-wrap break-words">
              {displayPost.content}
            </div>

            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{displayPost.commentsCount} comments</span>
              <span>{displayPost.repostsCount} reposts</span>
              <span>{displayPost.likesCount} likes</span>
            </div>

            <PostActions post={post.isRepost && post.originalPost ? post.originalPost : post} />
          </div>
        </div>
      </div>
    </div>
  );
}

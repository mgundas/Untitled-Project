"use client";

import { Post } from "@/app/store/usePostStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { PostActions } from "./PostActions";
import { EmbeddedPostCard } from "./EmbeddedPostCard";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Repeat2 } from "lucide-react";

export function PostCard({ post }: { post: Post }) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });

  // If this is a repost, show reposter info and embed original post
  if (post.isRepost && post.originalPost) {
    return (
      <div className="hover:bg-accent/50 transition-colors">
        <div className="p-4">
          <div className="flex gap-3">
            <Link href={`/profile/${post.authorId}`}>
              <Avatar className="h-10 w-10">
                <AvatarImage src={post.author.avatarUrl || undefined} />
                <AvatarFallback>
                  {post.author.fullName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Link href={`/profile/${post.authorId}`} className="font-semibold hover:underline">
                  {post.author.fullName || "Anonymous"}
                </Link>
                <span className="text-xs text-muted-foreground">{timeAgo}</span>
              </div>

              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Repeat2 className="h-3 w-3" />
                <span>Reposted</span>
              </div>

              <EmbeddedPostCard post={post.originalPost} />

              <PostActions post={post.originalPost} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular post display
  return (
    <div className="hover:bg-accent/50 transition-colors">
      <div className="p-4">
        <div className="flex gap-3">
          <Link href={`/profile/${post.authorId}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatarUrl || undefined} />
              <AvatarFallback>
                {post.author.fullName?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <Link href={`/profile/${post.authorId}`} className="font-semibold hover:underline">
                {post.author.fullName || "Anonymous"}
              </Link>
              <span className="text-xs text-muted-foreground">{timeAgo}</span>
            </div>

            <Link href={`/post/${post.id}`} className="block cursor-pointer">
              <div className="mt-1 text-sm whitespace-pre-wrap break-words">
                {post.content}
              </div>

              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{post.commentsCount} comments</span>
                <span>{post.repostsCount} reposts</span>
                <span>{post.likesCount} likes</span>
              </div>
            </Link>

            <PostActions post={post} />
          </div>
        </div>
      </div>
    </div>
  );
}

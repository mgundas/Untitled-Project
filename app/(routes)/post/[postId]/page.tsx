"use client";

import { use } from "react";
import { usePost } from "@/hooks/usePosts";
import { PostCard } from "@/app/components/posts/PostCard";
import { CommentsList } from "@/app/components/posts/CommentsList";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PostDetailPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = use(params);
  const { data: post, isLoading } = usePost(postId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="p-4 border-b">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="p-4">
          <div className="flex gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 text-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="w-full max-w-2xl mx-auto">
        <div className="sticky top-0 bg-background border-b z-10 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <PostCard post={post} />

        <div className="border-t">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">Comments</h2>
          </div>
          <CommentsList postId={postId} />
        </div>
      </div>
    </div>
  );
}

"use client";

import { usePostStore } from "@/app/store/usePostStore";
import { useCreatePost } from "@/hooks/usePosts";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PostComposer() {
  const { isComposerOpen, composerMode, commentOnPostId, closeComposer } = usePostStore();
  const createPost = useCreatePost();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;

    createPost.mutate({
      content: content.trim(),
      isComment: composerMode === "comment",
      postId: commentOnPostId || undefined,
    });

    setContent("");
  };

  const handleClose = () => {
    closeComposer();
    setContent("");
  };

  return (
    <Dialog open={isComposerOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {composerMode === "comment" ? "Add a comment" : "Create a post"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            placeholder={composerMode === "comment" ? "Write a comment..." : "What's on your mind?"}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={280}
            className="min-h-[120px]"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {content.length}/280
            </span>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || createPost.isPending}
              >
                {createPost.isPending
                  ? "Posting..."
                  : composerMode === "comment"
                  ? "Comment"
                  : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

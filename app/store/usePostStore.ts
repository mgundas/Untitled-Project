import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface Post {
  id: string;
  content: string;
  authorId: string;
  author: {
    id: string;
    fullName: string | null;
    avatarUrl: string | null;
  };
  createdAt: string;
  updatedAt: string | null;
  likesCount: number;
  repostsCount: number;
  commentsCount: number;
  isRepost: boolean;
  originalPostId: string | null;
  originalPost?: Post | null;
  isLikedByCurrentUser?: boolean;
  isRepostedByCurrentUser?: boolean;
}

interface PostState {
  // Optimistic update tracking
  optimisticLikes: Set<string>;
  optimisticUnlikes: Set<string>;
  optimisticReposts: Set<string>;

  toggleOptimisticLike: (postId: string, isLiked: boolean) => void;
  toggleOptimisticRepost: (postId: string) => void;
  clearOptimistic: (postId: string) => void;

  // Composer state
  isComposerOpen: boolean;
  composerMode: "create" | "comment";
  commentOnPostId: string | null;
  openComposer: (mode?: "create" | "comment", postId?: string) => void;
  closeComposer: () => void;
}

export const usePostStore = create<PostState>()(
  devtools((set) => ({
    optimisticLikes: new Set(),
    optimisticUnlikes: new Set(),
    optimisticReposts: new Set(),

    toggleOptimisticLike: (postId, isLiked) =>
      set((state) => {
        const newLikes = new Set(state.optimisticLikes);
        const newUnlikes = new Set(state.optimisticUnlikes);
        if (isLiked) {
          newLikes.add(postId);
          newUnlikes.delete(postId);
        } else {
          newUnlikes.add(postId);
          newLikes.delete(postId);
        }
        return { optimisticLikes: newLikes, optimisticUnlikes: newUnlikes };
      }),

    toggleOptimisticRepost: (postId) =>
      set((state) => {
        const newReposts = new Set(state.optimisticReposts);
        if (newReposts.has(postId)) {
          newReposts.delete(postId);
        } else {
          newReposts.add(postId);
        }
        return { optimisticReposts: newReposts };
      }),

    clearOptimistic: (postId) =>
      set((state) => {
        const newLikes = new Set(state.optimisticLikes);
        const newUnlikes = new Set(state.optimisticUnlikes);
        const newReposts = new Set(state.optimisticReposts);
        newLikes.delete(postId);
        newUnlikes.delete(postId);
        newReposts.delete(postId);
        return { optimisticLikes: newLikes, optimisticUnlikes: newUnlikes, optimisticReposts: newReposts };
      }),

    isComposerOpen: false,
    composerMode: "create",
    commentOnPostId: null,
    openComposer: (mode = "create", postId = null) =>
      set({ isComposerOpen: true, composerMode: mode, commentOnPostId: postId }),
    closeComposer: () =>
      set({ isComposerOpen: false, composerMode: "create", commentOnPostId: null }),
  }), { name: "PostStore" })
);

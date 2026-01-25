"use client";

import { useToggleFollow } from "@/hooks/usePosts";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export function FollowButton({ userId }: { userId: string }) {
  const toggleFollow = useToggleFollow();
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkFollowStatus() {
      try {
        const [profileRes, followingRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch(`/api/users/${userId}/followers`)
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setCurrentUserId(profileData.id);

          if (followingRes.ok) {
            const followingData = await followingRes.json();
            const isCurrentlyFollowing = followingData.followers.some(
              (follower: any) => follower.id === profileData.id
            );
            setIsFollowing(isCurrentlyFollowing);
          }
        }
      } catch (error) {
        console.error("Failed to check follow status:", error);
      } finally {
        setLoading(false);
      }
    }
    checkFollowStatus();
  }, [userId]);

  const handleFollow = () => {
    // Save current state for potential rollback
    const previousState = isFollowing;

    // Optimistically update UI immediately
    setIsFollowing(!isFollowing);

    toggleFollow.mutate({ userId }, {
      onSuccess: (data) => {
        // Confirm with actual value from server
        setIsFollowing(data.isFollowing);
      },
      onError: () => {
        // Rollback on error
        setIsFollowing(previousState);
      }
    });
  };

  // Don't show follow button on own profile
  if (currentUserId === userId) {
    return null;
  }

  if (loading) {
    return <Button variant="outline" disabled>Loading...</Button>;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollow}
      disabled={toggleFollow.isPending}
    >
      {toggleFollow.isPending ? "..." : isFollowing ? "Following" : "Follow"}
    </Button>
  );
}

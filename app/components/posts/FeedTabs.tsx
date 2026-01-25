"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostFeed } from "./PostFeed";
import { FollowingFeed } from "./FollowingFeed";

export function FeedTabs() {
  return (
    <Tabs defaultValue="for-you" className="w-full">
      <TabsList className="w-full sticky top-0 z-10 rounded-none border-b bg-background">
        <TabsTrigger value="for-you" className="flex-1">
          For You
        </TabsTrigger>
        <TabsTrigger value="following" className="flex-1">
          Following
        </TabsTrigger>
      </TabsList>

      <TabsContent value="for-you" className="mt-0">
        <PostFeed />
      </TabsContent>

      <TabsContent value="following" className="mt-0">
        <FollowingFeed />
      </TabsContent>
    </Tabs>
  );
}

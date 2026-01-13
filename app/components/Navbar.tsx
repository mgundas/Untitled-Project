"use client";

import { Github, GoalIcon } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import { ModeToggle } from "./ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import SettingsModal from "./SettingsModal";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return;

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />

      {session ? (
        <div className="flex items-center gap-4">
          <ModeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="default" onClick={() => signIn("github")}>
            <Github className="" />
            Sign in with GitHub
          </Button>
                    <Button variant="outline" size="default" onClick={() => signIn("google")}>
            <GoalIcon className="" />
            Sign in with Google
          </Button>
          <ModeToggle />
        </div>
      )}
    </header>
  );
}

"use client";

import { Github } from "lucide-react";
import { useSession, signIn } from "next-auth/react";
import LogModal from "./LogModal";
import { ModeToggle } from "./ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return;

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />

      {session ? (
        <div className="flex items-center gap-4">
          <LogModal />
          <ModeToggle />
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Button variant="outline" size="default" onClick={() => signIn("github")}>
            <Github className="" />
            Sign in with GitHub
          </Button>
          <ModeToggle />
        </div>
      )}
    </header>
  );
}

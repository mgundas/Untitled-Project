"use client";

import { EllipsisVertical, Github, Plus } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState } from "react";
import LogModal from "./LogModal";
import { addWin } from "../actions";
import { ModeToggle } from "./ModeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return;

  const handleAddWin = async (formData: FormData) => {
    await addWin(formData);
  };

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-6 py-2 sm:py-3 border-b bg-card sticky top-0 z-10 w-full">
      <SidebarTrigger className="-ml-1 sm:-ml-2" />

      {session ? (
        <div className="flex items-center gap-4">
          {/*          
          <button className=" rounded-full bg-white/5 text-slate-500 p-2 hover:text-slate-100 transition-colors ease-in-out duration-300 cursor-pointer">
            <Plus />
          </button> 
          <div className="bg-amber-700 p-2 rounded-full select-none">
            {session.user?.name?.split(" ")[0].slice(0, 1)}
            {session.user?.name?.split(" ")[1].slice(0, 1)}
          </div>
          */}
          <LogModal action={handleAddWin} />

          <button onClick={() => signOut()}>
            <EllipsisVertical />
          </button>
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

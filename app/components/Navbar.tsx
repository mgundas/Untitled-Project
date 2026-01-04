"use client";

import { EllipsisVertical, Plus } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState } from "react";
import LogModal from "./LogModal";
import { addWin } from "../actions";
import { ModeToggle } from "./ModeToggle";

export function Navbar() {
  const { data: session, status } = useSession();

  if (status === "loading") return;

  const handleAddWin = async (formData: FormData) => {
    await addWin(formData);
  };

  return (
    <nav className="flex items-center justify-between p-4 px-6 bg-neutral-100 dark:bg-neutral-900">
      <span className="text-xl">MastPlanner</span>

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
        <div>
          <button onClick={() => signIn("github")}>Login</button>
          <ModeToggle />
        </div>
      )}
    </nav>
  );
}

"use client";

import { EllipsisVertical, Plus } from "lucide-react";
import { useSession, signOut, signIn } from "next-auth/react";
import Modal from "./Modal";
import { useState } from "react";
import LogModal from "./LogModal";
import { addWin } from "../actions";

export function Navbar() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (status === "loading") return;

  const handleAddWin = async (formData: FormData) => {
    await addWin(formData);
    setIsModalOpen(false);
  }

  return (
    <nav className="flex items-center justify-between p-4 px-6 bg-slate-950">
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
          <button onClick={() => setIsModalOpen(true)} className="p-2 rounded-full bg-fuchsia-600 shadow-lg shadow-fuchsia-900/40 hover:bg-fuchsia-500 active:scale-90 transition-all ease-in-out duration-300 cursor-pointer">
            <Plus />
          </button>
          <Modal isOpen={isModalOpen} onClose={() => {setIsModalOpen(false)}} title="Log a Session">
            <LogModal action={handleAddWin} />
          </Modal>

          <button onClick={() => signOut()}>
            <EllipsisVertical />
          </button>
        </div>
      ) : (
        <button onClick={() => signIn("github")}>Login</button>
      )}
    </nav>
  );
}

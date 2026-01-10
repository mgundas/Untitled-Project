"use server";
import { signOut } from "next-auth/react";

export default async function LogoutButton({children}: {children: React.ReactNode}) {
    return (
        <div onClick={() => signOut()}>
            {children}
        </div>
    );
}
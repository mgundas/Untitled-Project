import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "./components/Navbar";
import { Toaster } from "@/components/ui/sonner";
import { getServerSession } from "next-auth";
import { authOptions } from "./lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MastPlanner",
  description: "Track and manage your Masturbation Sessions with MastPlanner.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {session ? <AppSidebar /> : null}
          <main className="h-svh overflow-hidden lg:p-2 lg:pl-0 w-full">
            <div className="lg:border lg:rounded-xl overflow-hidden flex flex-col items-center justify-start h-full w-full bg-background">
              <Navbar />
              {children}
            </div>
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

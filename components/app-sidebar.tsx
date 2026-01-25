"use client";

import { ChevronsUpDown, Home, User, Bookmark, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import Link from "next/link";
import { useModal } from "@/app/store/useModalStateStore";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUnreadCount } from "@/hooks/useNotifications";

interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
}

export function AppSidebar() {
  const openModal = useModal((state) => state.open);
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count || 0;

  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user/profile");
        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const items = [
    {
      title: "Home",
      url: "/",
      icon: Home,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      title: "Bookmarks",
      url: "/bookmarks",
      icon: Bookmark,
    },
    ...(user ? [{
      title: "My Profile",
      url: `/profile/${user.id}`,
      icon: User,
    }] : []),
  ];

  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon">
      <SidebarHeader>
        <div className="group-data-[collapsible=icon]:hidden text-lg font-bold p-4">
          MastPlanner
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url} className="flex items-center gap-2">
                      <item.icon />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 p-2 group-data-[collapsible=icon]:mb-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center rounded-lg cursor-pointer hover:bg-accent transition-colors mt-2">
                <Avatar className="size-8 group-data-[collapsible=icon]:size-6">
                  <AvatarImage className="rounded-full" src={user?.avatarUrl || "/default-avatar.png"} />
                  <AvatarFallback className="text-xs">
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left group-data-[collapsible=icon]:hidden">
                  <p className="font-medium text-sm">{user?.fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || ""}
                  </p>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground shrink-0 group-data-[collapsible=icon]:hidden" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              <DropdownMenuGroup>
                {user && (
                  <DropdownMenuItem asChild>
                    <Link href={`/profile/${user.id}`}>Profile</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openModal("settings")}>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
    </Sidebar>
  );
}
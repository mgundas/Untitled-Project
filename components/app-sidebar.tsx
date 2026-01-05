import { Activity, ChevronsUpDown, Home } from "lucide-react";

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
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { AvatarFallback } from "./ui/avatar";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Guided Sensation",
    url: "/guided-sensation",
    icon: Activity,
  },
];

export async function AppSidebar() {
  const session = await getServerSession(authOptions);
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
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {session && (
        <SidebarFooter>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-accent transition-colors mt-2">
                <Avatar className="size-8">
                  <AvatarImage className="rounded-full" src={session.user?.image || "/default-avatar.png"} />
                  <AvatarFallback className="text-xs">SW</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sm">{session.user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
                <ChevronsUpDown className="size-4 text-muted-foreground shrink-0" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-50">
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}

import { Activity, Home } from "lucide-react"

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
} from "@/components/ui/sidebar"

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
  }
]

export function AppSidebar() {
  return (
    <Sidebar className="lg:border-r-0!" collapsible="icon">
    <SidebarHeader>
      <div className="group-data-[collapsible=icon]:hidden text-lg font-bold p-4">MastPlanner</div>
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
      <SidebarFooter>
        <div className="p-4 text-sm text-center text-gray-500 group-data-[collapsible=icon]:hidden">
          &copy; {new Date().getFullYear()} MastPlanner
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
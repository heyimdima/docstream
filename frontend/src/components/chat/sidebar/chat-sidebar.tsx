import { LogOut } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenuButton,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { logout } from "@/app/(auth)/actions";

export async function ChatSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>docstream</SidebarHeader>
      <SidebarContent></SidebarContent>

      <SidebarFooter>
        <form action={logout}>
          <SidebarMenuButton type="submit" className="w-full">
            <LogOut />
            <span>Sign Out</span>
          </SidebarMenuButton>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}

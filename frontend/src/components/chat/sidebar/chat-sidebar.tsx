import { RecentChats } from "./nav-recent-chats";
import { UserInfo } from "./nav-user-info";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

export async function ChatSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader>docstream</SidebarHeader>
      <SidebarContent>
        <RecentChats />
      </SidebarContent>

      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
}

// <form action={logout}>
//   <SidebarMenuButton type="submit" className="w-full">
//     <LogOut />
//     <span>Sign Out</span>
//   </SidebarMenuButton>
// </form>

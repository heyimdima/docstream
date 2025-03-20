import { RecentChats } from "./nav-recent-chats";
import { UserInfo } from "./nav-user-info";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

export async function ChatSidebar() {
  return (
    <Sidebar variant="sidebar">
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

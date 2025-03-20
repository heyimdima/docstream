import { RecentChats } from "./nav-recent-chats";
import { UserInfo } from "./nav-user-info";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarHeader } from "@/components/ui/sidebar";

export async function ChatSidebar() {
  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>docstream</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <Button asChild>
            <a href="/chat">
              New Chat
              <Plus />
            </a>
          </Button>
        </SidebarGroup>
        <RecentChats />
      </SidebarContent>

      <SidebarFooter>
        <UserInfo />
      </SidebarFooter>
    </Sidebar>
  );
}

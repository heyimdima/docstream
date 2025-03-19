import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { getChats } from "@/app/(protected)/chat/actions";

export async function RecentChats() {
  const chats = await getChats();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Show message if no chats */}
          {chats.length === 0 && <div className="px-2 py-4 text-sm text-muted-foreground">No recent chats</div>}

          {/* List of chats */}
          {chats.map((chat) => (
            <SidebarMenuItem key={chat.id}>
              <SidebarMenuButton asChild>
                <Link href={`/chat/${chat.id}`}>
                  <MessagesSquare className="h-4 w-4 mr-2" />
                  <span>{chat.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

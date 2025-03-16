import { createClient } from "@/utils/supabase/server";
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

// Define Chat type
interface Chat {
  id: string;
  title: string;
  // Add other properties as needed
}

// This function will be automatically memoized by Next.js
async function fetchChats() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return data as Chat[];
}

export async function RecentChats() {
  // Fetch chats directly in the component
  // Next.js will automatically deduplicate this request
  const chats = await fetchChats();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Recent chats</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {/* Show message if no chats */}
          {chats.length === 0 && (
            <div className="px-2 py-4 text-sm text-muted-foreground">
              No recent chats
            </div>
          )}

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

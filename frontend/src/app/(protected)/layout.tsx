import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatHeader } from "@/components/chat/sidebar/chat-header";
import { ChatSidebar } from "@/components/chat/sidebar/chat-sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatHeader />
        <div className="flex-1 overflow-y-auto">{children}</div>
        <footer className="text-center text-xs py-1 text-muted-foreground">AI can make mistakes. </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}

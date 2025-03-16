import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatHeader } from "@/components/chat/sidebar/chat-header";
import { ChatSidebar } from "@/components/chat/sidebar/chat-sidebar";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ChatSidebar />
      <SidebarInset>
        <ChatHeader />
        <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl mx-auto px-4">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

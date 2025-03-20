import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/chat/sidebar/chat-sidebar";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <SidebarProvider>
        <ChatSidebar />
        <div className="flex flex-col w-full">
          <header className="w-full">
            <SidebarTrigger className="p-4" />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </SidebarProvider>
    </div>
  );
}

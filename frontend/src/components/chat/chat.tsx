import { ChatPrompt } from "@/components/chat/chat-prompt";
import { ExistingChat } from "@/types/chat";
import { ChatMessages } from "./chat-messages";
import { Documentation } from "@/types/documentation";

interface ChatInterfaceProps {
  chat?: ExistingChat;
  documentations: Documentation[];
}

export function Chat({ chat, documentations }: ChatInterfaceProps) {
  const isNewChat = !chat;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={chat?.messages} />
      </div>
      <div className="sticky bottom-0 bg-background pt-2">
        <ChatPrompt documentatations={documentations} initialSelectedDocs={isNewChat ? [] : chat?.documentations} />
      </div>
    </div>
  );
}

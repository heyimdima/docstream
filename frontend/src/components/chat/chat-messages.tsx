import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types/message";

// Props for the ChatMessages component
interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <ScrollArea className="flex-1">
      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
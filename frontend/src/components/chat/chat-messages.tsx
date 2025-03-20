"use client";

import { useEffect, useRef } from "react";
import { Message } from "@/types/message";
import { cn } from "@/lib/utils";

interface ChatMessagesProps {
  messages: Message[];
  streamingMessage?: {
    id: string;
    content: string;
    role: string;
    created_at: Date;
  };
}

export function ChatMessages({ messages, streamingMessage }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change or streaming content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage?.content]);

  // Combine regular messages with streaming message if present
  const allMessages = streamingMessage ? [...messages, streamingMessage] : messages;

  return (
    <div className="space-y-4 max-w-3xl mx-auto px-4">
      {allMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">No messages yet</div>
      ) : (
        allMessages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "p-4 rounded-lg",
              message.role === "user"
                ? "bg-primary text-primary-foreground ml-auto max-w-[80%]"
                : "bg-muted mr-auto max-w-[80%]",
              message.id === "streaming" // Add subtle pulse animation for streaming message
            )}>
            <div className="whitespace-pre-wrap break-words">
              {message.content}
              {message.id === "streaming" && <span className="inline-block ml-1 animate-spin">&#10023;</span>}
            </div>
          </div>
        ))
      )}
      <div ref={messagesEndRef} /> {/* Invisible element to scroll to */}
    </div>
  );
}

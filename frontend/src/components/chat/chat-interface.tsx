"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { ChatDocumentation } from "@/types/chat-documentation";
import { addChatMessage, createNewChat } from "@/app/(protected)/chat/actions";
import { ExistingChat } from "@/types/chat";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import remarkGfm from "remark-gfm";

interface ChatInterfaceProps {
  initialChat?: ExistingChat;
}

export function ChatInterface({ initialChat }: ChatInterfaceProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[] | null>(initialChat?.messages || null);
  const [documentations] = useState<ChatDocumentation[] | null>(initialChat?.documentations || null);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Simple effect to scroll to the bottom when messages or currentResponse change
  useEffect(() => {
    // Scroll to bottom whenever messages change or new content is streamed
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "auto" });
    }
  }, [messages, currentResponse]);

  const sendMessage = async (prompt: string) => {
    try {
      let chatId: string;

      if (!initialChat) {
        chatId = await createNewChat(prompt);
        router.push(`/chat/${chatId}`);
      } else {
        chatId = initialChat.id;
      }

      const userMessage: Message = {
        chat_id: chatId,
        role: "user",
        content: prompt,
        created_at: new Date(),
      };

      // Create the updated messages array locally first
      const currentMessages = messages || [];
      const updatedMessages = [...currentMessages, userMessage];
      setMessages(updatedMessages);

      setPrompt("");

      // Set streaming to true and clear current response
      setStreaming(true);
      setCurrentResponse("");

      // API call and stream handling
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatHistory: updatedMessages,
          documentations: documentations,
        }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Process the stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Stream reader not available");

      const decoder = new TextDecoder();
      let completeResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        completeResponse += chunk;
        setCurrentResponse(completeResponse);
      }

      const aiMessage: Message = {
        chat_id: chatId,
        role: "ai",
        content: completeResponse,
        created_at: new Date(),
      };
      addChatMessage(userMessage);

      setMessages((prevMessages) => [...(prevMessages || []), aiMessage]);
      addChatMessage(aiMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!streaming && prompt.trim()) {
      sendMessage(prompt);
    }
  };

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {/* Main content area with proper scrolling */}
      <div className="flex-1 pb-20">
        <div className="space-y-4 p-4 max-w-3xl mx-auto">
          {messages?.map((message, index) => (
            <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <Card className={`p-4 max-w-2xl ${message.role === "user" ? "bg-secondary" : "bg-secondary"}`}>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              </Card>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <Card className={`p-4 max-w-2xl`}>
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentResponse}</ReactMarkdown>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input form - fixed position that respects sidebar width */}
      <div className="fixed bottom-0 left-64 right-0 bg-background border-t p-4 shadow-md z-10">
        <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto" name="chat-prompt-form">
          <Input
            type="text"
            name="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={streaming}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={streaming || !prompt.trim()} variant="default">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

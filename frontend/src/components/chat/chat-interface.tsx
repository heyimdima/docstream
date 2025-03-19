"use client";

import { useState, useEffect, useRef } from "react";
import { Message } from "@/types/message";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
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
    // Smoothly scroll to bottom whenever messages change or new content is streamed
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

      // No flags needed for simpler implementation

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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // @ts-ignore - Ignoring type issues with the component props
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          // @ts-expect-error - The type definitions for the style prop are incompatible
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Add some basic styling for common elements using ts-ignore to avoid type errors
                    // @ts-ignore
                    h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    // @ts-ignore
                    h2: (props) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    // @ts-ignore
                    h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    // @ts-ignore
                    p: (props) => <p className="mb-4" {...props} />,
                    // @ts-ignore
                    ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    // @ts-ignore
                    ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    // @ts-ignore
                    li: (props) => <li className="mb-1" {...props} />,
                    // @ts-ignore
                    table: (props) => <table className="border-collapse mb-4" {...props} />,
                    // @ts-ignore
                    th: (props) => <th className="border border-gray-600 px-4 py-2" {...props} />,
                    // @ts-ignore
                    td: (props) => <td className="border border-gray-600 px-4 py-2" {...props} />,
                  }}>
                  {message.content}
                </ReactMarkdown>
              </Card>
            </div>
          ))}

          {streaming && (
            <div className="flex justify-start">
              <Card className={`p-4 max-w-2xl`}>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // @ts-ignore - Ignoring type issues with the component props
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          // @ts-expect-error - The type definitions for the style prop are incompatible
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          {...props}>
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-gray-800 px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Add some basic styling for common elements using ts-ignore to avoid type errors
                    // @ts-ignore
                    h1: (props) => <h1 className="text-2xl font-bold mt-6 mb-4" {...props} />,
                    // @ts-ignore
                    h2: (props) => <h2 className="text-xl font-bold mt-5 mb-3" {...props} />,
                    // @ts-ignore
                    h3: (props) => <h3 className="text-lg font-bold mt-4 mb-2" {...props} />,
                    // @ts-ignore
                    p: (props) => <p className="mb-4" {...props} />,
                    // @ts-ignore
                    ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
                    // @ts-ignore
                    ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                    // @ts-ignore
                    li: (props) => <li className="mb-1" {...props} />,
                    // @ts-ignore
                    table: (props) => <table className="border-collapse mb-4" {...props} />,
                    // @ts-ignore
                    th: (props) => <th className="border border-gray-600 px-4 py-2" {...props} />,
                    // @ts-ignore
                    td: (props) => <td className="border border-gray-600 px-4 py-2" {...props} />,
                  }}>
                  {currentResponse}
                </ReactMarkdown>
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

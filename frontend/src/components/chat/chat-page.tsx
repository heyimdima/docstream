"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatPrompt } from "@/components/chat/chat-prompt";
import { ChatMessages } from "@/components/chat/chat-messages";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Documentation } from "@/types/documentation";
import { Message } from "@/types/message";
import { ExistingChat } from "@/types/chat";
import { createNewChat, addChatMessage, updateChatDocumentations, getChatById } from "@/app/(protected)/chat/actions";
import { ChatDocumentation } from "@/types/chat-documentation";

interface ChatPageProps {
  availableDocumentations: Documentation[];
  chatId?: string;
}

export default function ChatPage({ availableDocumentations, chatId: serverChatId }: ChatPageProps) {
  const router = useRouter();

  // Track the effective chat ID (from server or locally generated)
  const [effectiveChatId, setEffectiveChatId] = useState<string | undefined>(serverChatId);
  const [chat, setChat] = useState<ExistingChat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedResponse, setStreamedResponse] = useState("");

  // Fetch chat data if we have a serverChatId
  useEffect(() => {
    async function loadChat() {
      if (serverChatId) {
        setIsLoading(true);
        try {
          const chatData = await getChatById(serverChatId);
          setChat(chatData);
          setEffectiveChatId(serverChatId);
        } catch (error) {
          console.error("Failed to fetch chat:", error);
          router.push("/chat");
        } finally {
          setIsLoading(false);
        }
      }
    }

    loadChat();
  }, [serverChatId, router]);

  const streamResponse = async (currentMessages: Message[], currentDocs: Documentation[]) => {
    setIsStreaming(true);
    setStreamedResponse("");

    const response = await fetch("/api/chat/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chatHistory: currentMessages,
        chatDocumentations: currentDocs,
      }),
    });
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Stream reader not available");

    const decoder = new TextDecoder();
    let fullResponse = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      setStreamedResponse(fullResponse);
    }
    setIsStreaming(false);
    return fullResponse;
  };

  const handleSubmitMessage = async (prompt: string, selectedDocs: Documentation[]) => {
    if (!prompt.trim()) return;

    // ---- Handle New Chat ----
    if (!effectiveChatId) {
      // Generate a new UUID for the chat
      const newChatId = uuidv4().toString();

      // Create the user message
      const userMessage: Message = {
        id: uuidv4().toString(),
        chat_id: newChatId,
        content: prompt,
        role: "user",
        created_at: new Date(),
      };

      // Create chat documentations
      const chatDocs: ChatDocumentation[] = selectedDocs.map((doc) => ({
        id: uuidv4().toString(),
        chat_id: newChatId,
        documentation_id: doc.id,
        attached_at: new Date(),
      }));

      // Create a local representation of the initial chat state
      const initialChat: ExistingChat = {
        id: newChatId,
        messages: [userMessage],
        documentations: chatDocs,
      };

      // Update state
      setEffectiveChatId(newChatId);
      setChat(initialChat);

      // Update URL immediately
      window.history.pushState({}, "", `/chat/${newChatId}`);

      // Start streaming AI response with the current messages
      const responseText = await streamResponse(initialChat.messages, selectedDocs);

      // Create the AI message
      const aiMessage: Message = {
        id: uuidv4().toString(),
        chat_id: newChatId,
        content: responseText,
        role: "ai",
        created_at: new Date(),
      };

      // Create a local updated chat that includes the AI response
      const updatedChat = {
        ...initialChat,
        messages: [...initialChat.messages, aiMessage],
      };

      // Update the UI with the AI message
      setChat(updatedChat);

      // Persist everything to the database
      try {
        await createNewChat(newChatId, prompt);
        await addChatMessage(userMessage);
        await addChatMessage(aiMessage);
        await updateChatDocumentations(newChatId, selectedDocs);
      } catch (error) {
        console.error("Failed to persist chat:", error);
      }
    }
    // ---- Handle Existing Chat ----
    else {
      // Early return if chat is null
      if (!chat) {
        console.error("Chat is null for existing chat flow");
        return;
      }

      // Create user message
      const userMessage: Message = {
        id: uuidv4().toString(),
        chat_id: effectiveChatId,
        content: prompt,
        role: "user",
        created_at: new Date(),
      };

      // Create local representation of updated messages
      const updatedMessages = [...chat.messages, userMessage];

      const updatedChatDocs: ChatDocumentation[] = selectedDocs.map((doc) => ({
        id: uuidv4().toString(),
        chat_id: effectiveChatId,
        documentation_id: doc.id,
        attached_at: new Date(),
      }));

      // Update local chat state with user message AND updated docs
      const updatedChat = {
        ...chat,
        messages: updatedMessages,
        documentations: updatedChatDocs, // Update the documentations in the chat state
      };

      // Update state
      setChat(updatedChat);

      // Start streaming with the updated messages
      const responseText = await streamResponse(updatedMessages, selectedDocs);

      // Create AI message
      const aiMessage: Message = {
        id: uuidv4().toString(),
        chat_id: effectiveChatId,
        content: responseText,
        role: "ai",
        created_at: new Date(),
      };

      // Create final local chat state with AI message
      const finalChat = {
        ...updatedChat,
        messages: [...updatedMessages, aiMessage],
      };

      // Update UI with AI message
      setChat(finalChat);

      // Persist to database
      try {
        await addChatMessage(userMessage);
        await addChatMessage(aiMessage);
        await updateChatDocumentations(effectiveChatId, selectedDocs);
      } catch (error) {
        console.error("Failed to persist messages:", error);
      }
    }
  };

  // Is this a new chat view?
  const isNewChatView = !effectiveChatId && (!chat || chat.messages.length === 0);

  // Loading state for initial chat load
  if (isLoading && serverChatId && !chat) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex flex-col ${isNewChatView ? "justify-center" : ""}`}>
      {!isNewChatView && (
        <div className="flex-1 overflow-y-auto pb-4">
          <ChatMessages
            messages={chat?.messages || []}
            streamingMessage={
              isStreaming
                ? {
                    id: "streaming",
                    content: streamedResponse,
                    role: "ai",
                    created_at: new Date(),
                  }
                : undefined
            }
          />
        </div>
      )}

      <div className={isNewChatView ? "px-4" : "sticky bottom-0 pt-2 pb-2 px-4"}>
        <ChatPrompt
          documentations={availableDocumentations}
          initialSelectedDocs={chat?.documentations || []}
          onSubmit={handleSubmitMessage}
          isLoading={isLoading || isStreaming}
        />
        <footer className="text-center text-muted-foreground text-xs mt-2 pb-2">
          AI can make mistakes. Always verify the information provided.
        </footer>
      </div>
    </div>
  );
}

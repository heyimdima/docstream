"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { Chat } from "@/types/chat";
import { Message } from "@/types/message";
import { ChatDocumentation } from "@/types/chat-documentation";
import { Documentation } from "@/types/documentation";
import { ExistingChat } from "@/types/chat";

// Create a new chat
export async function createNewChat(prompt: string) {
  const supabase = await createClient();

  // Create a new chat entry
  const { data: chat, error } = await supabase
    .from("chats")
    .insert({ title: prompt.slice(0, 50) })
    .select()
    .single();

  if (error) {
    console.error("Error creating a new chat:", error);
    throw new Error("Failed to create a new chat");
  }
  revalidatePath("/chat");

  return chat.id as string;
}

export async function addChatDocumentation(chat_id: string, documentation_id: string) {
  const supabase = await createClient();

  const { data: error } = await supabase
    .from("chat_documentations")
    .insert({ chat_id: chat_id, documentation_id: documentation_id });

  if (error) {
    console.error("Error adding documentation to chat:", error);
    throw new Error("Failed to add documentation to chat");
  }
}

export async function removeChatDocumentation(chat_id: string, documentation_id: string) {
  const supabase = await createClient();

  const { data: error } = await supabase
    .from("chat_documentations")
    .delete()
    .eq("chat_id", chat_id)
    .eq("documentation_id", documentation_id);
}

export async function addChatMessage(message: Message) {
  console.log("Adding message to chat: ", message);
  const supabase = await createClient();

  const { error } = await supabase
    .from("messages")
    .insert({ chat_id: message.chat_id, content: message.content, role: message.role });

  if (error) {
    console.error("Error adding message to chat:", error);
    throw new Error("Failed to add message to chat");
  }
}

export async function getChats() {
  const supabase = await createClient();
  const { data: chats, error } = await supabase.from("chats").select().order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching chats:", error);
    return [];
  }

  return chats as Chat[];
}

export async function getChatById(chat_id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chats")
    .select("*, messages(*), chat_documentations(*)")
    .eq("id", chat_id);

  if (error) {
    console.error("Error fetching chat_documentations:", error);
    throw new Error("Failed to get chat");
  }

  if (data && data.length > 0) {
    // Sort messages by created_at
    if (data[0].messages) {
      data[0].messages.sort((a: Message, b: Message) => {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    }

    // Sort chat_documentations by created_at
    if (data[0].chat_documentations) {
      data[0].chat_documentations.sort((a: ChatDocumentation, b: ChatDocumentation) => {
        return new Date(a.attached_at).getTime() - new Date(b.attached_at).getTime();
      });
    }
  }

  const chat = data[0];

  const existingChat = {
    id: chat_id,
    messages: chat.messages,
    documentations: chat.chat_documentations,
  } as ExistingChat;

  return existingChat as ExistingChat;
}

export async function getAvaliableDocumentations() {
  const supabase = await createClient();

  const { data: documentations, error } = await supabase.from("documentations").select();

  if (error) {
    console.error("Error fetching documentations:", error);
    throw new Error("Failed to add documentation to chat");
  }

  return documentations as Documentation[];
}

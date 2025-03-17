"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Create a new chat
export async function createNewChat(formData: FormData) {
  const supabase = await createClient();

  // Get title from form or use a default title
  const title = (formData.get("title") as string) || "New Chat";

  // Create a new chat entry
  const { data: chat, error } = await supabase
    .from("chats")
    .insert([
      {
        title: title,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    throw new Error("Failed to create chat");
  }

  // Revalidate the chats list to update it across the site
  revalidatePath("/chat");

  // Redirect to the new chat
  redirect(`/chat/${chat.id}`);
}

import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { getAvaliableDocumentations } from "./actions";
import ChatPage from "@/components/chat/chat-page";

export default async function NewChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }
  const documentations = await getAvaliableDocumentations();

  return <ChatPage availableDocumentations={documentations} />;
}

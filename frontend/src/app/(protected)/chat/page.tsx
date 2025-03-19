import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { ChatInterface } from "@/components/chat/chat-interface";

export default async function NewChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }

  return (
    <div>
      <ChatInterface />
    </div>
  );
}

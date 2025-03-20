import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";
import { Chat } from "@/components/chat/chat";
import { getAvaliableDocumentations } from "./actions";

export default async function NewChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/sign-in");
  }
  const avaliableDocumentations = await getAvaliableDocumentations();

  return <Chat documentations={avaliableDocumentations} />;
}

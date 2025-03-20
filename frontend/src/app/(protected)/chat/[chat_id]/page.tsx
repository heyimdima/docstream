import { Chat } from "@/components/chat/chat";
import { getAvaliableDocumentations, getChatById } from "@/app/(protected)/chat/actions";

export default async function ChatPage({ params }: { params: Promise<{ chat_id: string }> }) {
  const { chat_id } = await params;
  const initialChat = await getChatById(chat_id);
  const avaliableDocumentations = await getAvaliableDocumentations();

  return <Chat chat={initialChat} documentations={avaliableDocumentations} />;
}

import { ChatInterface } from "@/components/chat/chat-interface";
import { getChatById } from "@/app/(protected)/chat/actions";

export default async function ChatPage({ params }: { params: Promise<{ chat_id: string }> }) {
  const { chat_id } = await params;
  const initialChat = await getChatById(chat_id);

  return (
    <div>
      <ChatInterface initialChat={initialChat} />
    </div>
  );
}

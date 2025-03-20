// "use client";

// import { Chat } from "@/components/chat/chat";
// import { getAvaliableDocumentations, getChatById } from "@/app/(protected)/chat/actions";

// export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
//   const { id } = await params;
//   const initialChat = await getChatById(id);
//   const avaliableDocumentations = await getAvaliableDocumentations();

//   return <Chat chat={initialChat} documentations={avaliableDocumentations} />;
// }

// app/chat/[id]/page.tsx
import ChatPage from "@/components/chat/chat-page";
import { getAvaliableDocumentations } from "@/app/(protected)/chat/actions";

export default async function ExistingChatPage({ params }: { params: { id: string } }) {
  // Params is not a Promise, it's a direct object
  const { id } = await params;
  const documentations = await getAvaliableDocumentations();

  // Pass the chat ID directly to the client component
  return <ChatPage availableDocumentations={documentations} chatId={id} />;
}

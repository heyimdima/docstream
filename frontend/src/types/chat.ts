import { Message } from "@/types/message";
import { ChatDocumentation } from "@/types/chat-documentation";

export interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: Date;
}

export interface ExistingChat {
  id: string;
  messages: Message[];
  documentations: ChatDocumentation[];
}

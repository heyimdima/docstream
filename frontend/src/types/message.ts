export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "ai";
  content: string;
  created_at: Date;
}

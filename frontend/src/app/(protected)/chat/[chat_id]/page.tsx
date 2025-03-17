export default async function Page({
    params,
  }: {
    params: Promise<{ chat_id: string }>;
  }) {
    const { chat_id } = await params;
    return <div>Chat ID: {chat_id}</div>;
  }
import { ChatContainer } from '@/components/chat/ChatContainer';

export default async function ChatPage({ params }: { params: Promise<{ id?: string }> }) {
  const resolvedParams = await params;
  return <ChatContainer initialChatId={resolvedParams.id} />;
}
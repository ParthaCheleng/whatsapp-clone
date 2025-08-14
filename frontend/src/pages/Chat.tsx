// src/pages/Chat.tsx
import { useState } from 'react';
import useConversations from '../hooks/useConversations';
import useMessages from '../hooks/useMessages';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import Composer from '../components/Composer';
import EmptyState from '../components/EmptyState';

export default function ChatPage() {
  const { data: conversations = [] } = useConversations();
  const [active, setActive] = useState<string | undefined>();
  const { data: messages = [], setData: setMessages } = useMessages(active);
  const title =
    conversations.find((c: any) => c.wa_id === active)?.name ||
    active ||
    'Chat';

  return (
    <div className="h-screen w-screen flex">
      <Sidebar items={conversations} activeWaId={active} onSelect={setActive} />
      <main className="flex-1 flex flex-col">
        {active ? (
          <>
            <ChatHeader title={title} />
            <MessageList messages={messages as any[]} />
            <Composer
              wa_id={active}
              onSent={(text: string) =>
                setMessages((prev: any[]) => [
                  ...prev,
                  {
                    _id: Math.random().toString(36).slice(2),
                    wa_id: active!,
                    direction: 'outgoing',
                    type: 'text',
                    text,
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                  },
                ])
              }
            />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

// src/pages/Chat.tsx
import { useEffect, useState } from "react";
import useConversations from "../hooks/useConversations";
import useMessages from "../hooks/useMessages";
import Sidebar from "../components/Sidebar";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import Composer from "../components/Composer";
import EmptyState from "../components/EmptyState";

export default function ChatPage() {
  const { data: conversations = [] } = useConversations();
  const [active, setActive] = useState<string | undefined>();

  // pick first conversation automatically
  useEffect(() => {
    if (!active && conversations.length > 0) {
      setActive(conversations[0].wa_id);
    }
  }, [active, conversations]);

  const {
    data: messages = [],
    setData: setMessages,
    send: sendMessage,
  } = useMessages(active);

  const title =
    conversations.find((c: any) => c.wa_id === active)?.name || active || "Chat";

  return (
    <div className="h-screen w-screen flex">
      <Sidebar items={conversations as any[]} activeWaId={active} onSelect={setActive} />
      <main className="flex-1 flex flex-col">
        {active ? (
          <>
            <ChatHeader title={title} />
            <MessageList messages={messages as any[]} />
            <Composer
              wa_id={active}
              onSent={(text) => {
                // optimistic + persist handled inside the hook
                sendMessage(text);
              }}
            />
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}

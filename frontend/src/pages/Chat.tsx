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

  // active chat id (string)
  const [activeWaId, setActiveWaId] = useState<string | undefined>();
  const [hasAutoOpened, setHasAutoOpened] = useState(false);

  // Only auto-open first conversation on desktop
  useEffect(() => {
    if (hasAutoOpened) return;

    const isDesktop =
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 768px)").matches;

    if (isDesktop && !activeWaId && conversations.length > 0) {
      setActiveWaId(conversations[0].wa_id);
      setHasAutoOpened(true);
    }
  }, [activeWaId, conversations, hasAutoOpened]);

  const { data: messages = [], send: sendMessage } = useMessages(activeWaId);
  const active = conversations.find((c: any) => c.wa_id === activeWaId);
  const title = active?.name || activeWaId || "Chat";
  const subtitle = active?.wa_id;

  // mobile master/detail toggling
  const showListOnMobile = !activeWaId;
  const showChatOnMobile = !!activeWaId;

  return (
    <div className="h-dvh md:h-screen w-full bg-neutral-50">
      <div className="mx-auto h-full max-w-6xl md:grid md:grid-cols-[320px_1fr]">
        {/* LIST (Sidebar) */}
        <div className={showListOnMobile ? "block h-full" : "hidden h-full md:block"}>
          <Sidebar
            items={conversations as any[]}
            activeWaId={activeWaId}
            onSelect={(c: any) => setActiveWaId(c.wa_id)} // select conversation
          />
        </div>

        {/* CHAT */}
        <main className={showChatOnMobile ? "block h-full" : "hidden h-full md:block"}>
          {activeWaId ? (
            <div className="flex h-full flex-col bg-white">
              <ChatHeader
                title={title}
                subtitle={subtitle}
                onBack={() => setActiveWaId(undefined)} // BACK TO LIST ON MOBILE
              />

              <div className="flex min-h-0 flex-1 flex-col">
                <MessageList
                  messages={messages as any[]}
                  className="flex-1 overflow-y-auto px-3 py-4 md:px-6 md:py-6 pb-24"
                />

                <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur">
                  <Composer
                    wa_id={activeWaId}
                    onSent={(text) => {
                      if (!text.trim()) return;
                      sendMessage(text);
                    }}
                  />
                  <div className="h-[env(safe-area-inset-bottom)]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full">
              <EmptyState />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

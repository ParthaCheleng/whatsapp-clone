import React, { useEffect, useRef } from "react";
import type { Message } from "../hooks/useMessages";

function StatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const glyph =
    status === "read" ? "✓✓" :
    status === "delivered" ? "✓✓" :
    status === "sent" ? "✓" :
    status === "failed" ? "!" : "";

  const extra =
    status === "read" ? "text-blue-500" :
    status === "failed" ? "text-red-500" : "text-gray-500";

  return <span className={`ml-2 text-[11px] ${extra}`}>{glyph}</span>;
}

export default function MessageList({
  messages = [] as Message[],
  className = "",
}: {
  messages?: Message[];
  className?: string;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={className}>
      <div className="max-w-3xl mx-auto w-full space-y-2">
        {messages.map((m) => {
          const time =
            m.timestamp &&
            new Date(m.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

          const mine = m.direction === "outgoing";

          return (
            <div key={m._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`w-fit max-w-[85vw] md:max-w-[80%] break-words px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  mine ? "bg-blue-600 text-white" : "bg-white border"
                }`}
                title={m.timestamp}
              >
                <div>{m.type === "text" ? m.text ?? "" : <em>{m.type}</em>}</div>
                <div
                  className={`mt-1 flex items-center gap-1 text-[11px] ${
                    mine ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  <span>{time}</span>
                  {mine && <StatusBadge status={m.status} />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}

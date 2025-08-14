import React, { useEffect, useRef } from "react";

export type Message = {
  _id: string;
  wa_id: string;
  direction: "incoming" | "outgoing";
  type: "text" | string;
  text?: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read" | string;
};

export default function MessageList({ messages = [] as Message[] }: { messages?: Message[] }) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-3xl mx-auto w-full p-4 space-y-2">
        {messages.map(m => (
          <div
            key={m._id}
            className={`w-fit max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
              m.direction === "outgoing"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-white border"
            }`}
            title={m.timestamp}
          >
            {m.type === "text" ? (m.text ?? "") : <em>{m.type}</em>}
          </div>
        ))}
        <div ref={endRef} />
      </div>
    </div>
  );
}

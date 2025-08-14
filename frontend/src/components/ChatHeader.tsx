import React from "react";

export default function ChatHeader({ title }: { title: string }) {
  return (
    <header className="h-14 px-4 flex items-center border-b bg-white/60 backdrop-blur">
      <h2 className="text-lg font-semibold truncate">{title}</h2>
    </header>
  );
}

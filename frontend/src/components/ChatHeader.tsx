import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void; // if provided, a Back button appears on mobile
};

export default function ChatHeader({ title, subtitle, onBack }: Props) {
  return (
    <header className="h-14 px-3 md:px-4 flex items-center gap-2 border-b bg-white/70 backdrop-blur">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="md:hidden -ml-1 inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-100"
          aria-label="Back"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      <div className="min-w-0">
        <h2 className="text-base md:text-lg font-semibold truncate leading-none">
          {title}
        </h2>
        {subtitle ? (
          <div className="truncate text-xs text-neutral-500">{subtitle}</div>
        ) : null}
      </div>
    </header>
  );
}

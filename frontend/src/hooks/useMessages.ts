import { useEffect, useState, useCallback } from "react";

export type Message = {
  _id: string;
  wa_id: string;
  direction: "incoming" | "outgoing";
  type: "text" | string;
  text?: string;
  timestamp?: string;
  status?: "sent" | "delivered" | "read" | "failed" | string;
};

const API = import.meta.env.VITE_API_URL;

export default function useMessages(wa_id?: string) {
  const [data, setData] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // fetch when wa_id changes
  useEffect(() => {
    if (!wa_id) {
      setData([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API}/api/messages?wa_id=${encodeURIComponent(wa_id)}`);
        if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);
        const json = await res.json();
        if (!cancelled) setData(json || []);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [wa_id]);

  /** Send a text message (optimistic UI + persist to DB) */
  const send = useCallback(async (text: string) => {
    if (!wa_id || !text.trim()) return;

    // optimistic bubble
    const optimistic: Message = {
      _id: crypto.randomUUID(),
      wa_id,
      direction: "outgoing",
      type: "text",
      text,
      timestamp: new Date().toISOString(),
      status: "sent",
    };
    setData(prev => [...prev, optimistic]);

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wa_id, text }),
      });
      if (!res.ok) throw new Error(`Failed to send (${res.status})`);
      const saved: Message = await res.json();

      // replace optimistic with saved (keeps order)
      setData(prev => prev.map(m => (m._id === optimistic._id ? saved : m)));
      return saved;
    } catch (e) {
      // mark failed
      setData(prev => prev.map(m => (m._id === optimistic._id ? { ...m, status: "failed" } : m)));
      throw e;
    }
  }, [wa_id]);

  return { data, setData, loading, error, send };
}

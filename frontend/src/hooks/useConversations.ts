import { useEffect, useState } from "react";

export type Conversation = {
  _id?: string;
  wa_id: string;
  name?: string;
  lastMessage?: string | null;
  lastTimestamp?: string | null;
  lastStatus?: string | null;
};

const API = import.meta.env.VITE_API_URL;

export default function useConversations() {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        // IMPORTANT: /api prefix is required (Option A)
        const res = await fetch(`${API}/api/conversations`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const json = await res.json();
        if (!cancelled) setData(Array.isArray(json) ? json : []);
      } catch (e) {
        if (!cancelled) {
          console.error("Failed to load conversations:", e);
          setError(e);
          setData([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}

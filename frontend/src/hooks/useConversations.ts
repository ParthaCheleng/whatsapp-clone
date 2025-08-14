import { useEffect, useState } from 'react';
import { fetchConversations } from '../api/client';
import type { Conversation } from '../types';

export default function useConversations() {
  const [data, setData] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try { setData(await fetchConversations()); }
      catch (e:any) { setError(e?.message ?? 'Failed to load conversations'); }
      finally { setLoading(false); }
    })();
  }, []);

  return { data, loading, error };
}

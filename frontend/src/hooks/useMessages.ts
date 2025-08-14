import { useEffect, useRef, useState } from 'react';
import { fetchMessages } from '../api/client';
import type { ProcessedMessage } from '../types';
import { getSocket } from '../sockets/io';

export default function useMessages(wa_id?: string) {
  const [data, setData] = useState<ProcessedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  useEffect(() => {
    if (!wa_id) return;
    setLoading(true);
    fetchMessages(wa_id)
      .then((d) => mounted.current && setData(d))
      .catch((e) => setError(e?.message ?? 'Failed to load messages'))
      .finally(() => mounted.current && setLoading(false));
  }, [wa_id]);

  useEffect(() => {
    if (!wa_id) return;
    const socket = getSocket();
    const onNew = (msg: ProcessedMessage) => { if (msg.wa_id === wa_id) setData((p) => [...p, msg]); };
    const onStatus = (u: { message_id: string; status: string }) =>
      setData((p) => p.map((m) => (m.message_id === u.message_id ? { ...m, status: u.status as any } : m)));

    socket.on('message:new', onNew);
    socket.on('message:status', onStatus);
    return () => { socket.off('message:new', onNew); socket.off('message:status', onStatus); };
  }, [wa_id]);

  return { data, setData, loading, error };
}

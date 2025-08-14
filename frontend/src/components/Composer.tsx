import { useState } from 'react';
export default function Composer({ wa_id, onSent }:{ wa_id?: string; onSent:(t:string)=>void }) {
  const [value, setValue] = useState('');
  const send = () => { if (!wa_id || !value.trim()) return; onSent(value); setValue(''); };
  return (
    <div className="h-16 border-t bg-white px-3 flex items-center gap-2">
      <input
        className="flex-1 border rounded-xl px-3 py-2 outline-none focus:ring-2 ring-brand-600"
        placeholder={wa_id ? 'Type a message…' : 'Select a chat'}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        onKeyDown={(e)=>e.key==='Enter' && send()}
        disabled={!wa_id}
      />
      <button className="px-4 py-2 rounded-xl bg-brand-600 text-white disabled:opacity-50"
              disabled={!wa_id || !value.trim()} onClick={send}>
        Send
      </button>
    </div>
  );
}

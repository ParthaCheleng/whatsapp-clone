import dayjs from 'dayjs';
import clsx from 'clsx';
import type { Conversation } from '../types';

export default function Sidebar({
  items, activeWaId, onSelect
}: { items: Conversation[]; activeWaId?: string; onSelect: (id: string) => void }) {
  return (
    <aside className="w-80 border-r bg-white overflow-y-auto">
      <div className="p-4 text-lg font-semibold">Chats</div>
      <ul>
        {items.map(c => (
          <li key={c.wa_id}
              onClick={() => onSelect(c.wa_id)}
              className={clsx('px-4 py-3 cursor-pointer hover:bg-gray-50 border-b',
                              activeWaId === c.wa_id && 'bg-green-50')}>
            <div className="font-medium">{c.name || c.wa_id}</div>
            <div className="text-xs text-gray-500">
              {c.last_updated_at ? dayjs(c.last_updated_at).format('DD MMM, HH:mm') : ''}
            </div>
          </li>
        ))}
        {items.length === 0 && <li className="p-4 text-sm text-gray-500">No conversations yet.</li>}
      </ul>
    </aside>
  );
}

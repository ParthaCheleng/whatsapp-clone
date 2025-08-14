import dayjs from "dayjs";
import clsx from "clsx";

export type Conversation = {
  _id?: string;
  wa_id: string;
  name?: string;
  lastMessage?: string | null;
  lastTimestamp?: string | null;
  lastStatus?: string | null;
};

export default function Sidebar({
  items,
  activeWaId,
  onSelect,
}: {
  items: Conversation[];
  activeWaId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="w-80 border-r bg-white overflow-y-auto">
      <div className="p-4 text-lg font-semibold">Chats</div>
      <ul>
        {items.map((c) => {
          const when = c.lastTimestamp
            ? dayjs(c.lastTimestamp).format("DD MMM, HH:mm")
            : "";

          return (
            <li
              key={c.wa_id}
              onClick={() => onSelect(c.wa_id)}
              className={clsx(
                "px-4 py-3 cursor-pointer hover:bg-gray-50 border-b",
                activeWaId === c.wa_id && "bg-green-50"
              )}
            >
              <div className="flex items-baseline justify-between">
                <div className="font-medium truncate max-w-[70%]">
                  {c.name || c.wa_id}
                </div>
                <div className="text-[11px] text-gray-500">{when}</div>
              </div>
              <div className="text-xs text-gray-500 truncate">
                {c.lastMessage ?? ""}
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="p-4 text-sm text-gray-500">No conversations yet.</li>
        )}
      </ul>
    </aside>
  );
}

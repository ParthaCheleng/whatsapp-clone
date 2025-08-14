export function parsePayload(p: any) {
  const results: { kind: "message" | "status"; data: any }[] = [];
  const changes = p?.entry?.[0]?.changes?.[0]?.value;
  if (!changes) return results;

  if (Array.isArray(changes.messages)) {
    for (const m of changes.messages) {
      results.push({
        kind: "message",
        data: {
          message_id: m.id ?? null,
          meta_msg_id: m.meta_msg_id ?? null,
          wa_id: m.from || changes.metadata?.display_phone_number || "unknown",
          name: changes?.contacts?.[0]?.profile?.name ?? null,
          direction: "incoming",
          type: m.type || "text",
          text: m.text?.body ?? null,
          media: m.image ? { mime: m.image?.mime_type, url: m.image?.id, caption: m.image?.caption } : null,
          timestamp: new Date(Number(m.timestamp) * 1000)
        }
      });
    }
  }

  if (Array.isArray(changes.statuses)) {
    for (const s of changes.statuses) {
      results.push({
        kind: "status",
        data: { id: s.id, status: s.status, ts: new Date(Number(s.timestamp) * 1000) }
      });
    }
  }
  return results;
}

// Normalized shapes used elsewhere in the app
export type Normalized =
  | {
      kind: "message";
      doc: {
        wa_id: string;
        name?: string;
        direction: "incoming" | "outgoing";
        type: "text";
        text?: string;
        timestamp: Date;
        meta_msg_id?: string;
        status?: "sent" | "delivered" | "read" | "failed";
      };
    }
  | {
      kind: "status";
      meta_msg_id: string;
      status: "sent" | "delivered" | "read" | "failed";
    };

// ---------- helpers ----------
function first<T = any>(...vals: any[]): T | undefined {
  for (const v of vals) if (v !== undefined && v !== null) return v as T;
  return undefined;
}
function asDate(v: any): Date {
  if (v == null) return new Date();
  if (typeof v === "number") return v > 10_000_000_000 ? new Date(v) : new Date(v * 1000);
  if (typeof v === "string" && /^[0-9]+$/.test(v)) {
    const n = Number(v);
    return n > 10_000_000_000 ? new Date(n) : new Date(n * 1000);
  }
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
function normStatus(s: any): "sent" | "delivered" | "read" | "failed" | undefined {
  if (!s) return undefined;
  const v = String(s).toLowerCase();
  if (["sent", "submitted"].includes(v)) return "sent";
  if (["delivered", "delivery"].includes(v)) return "delivered";
  if (["read", "seen"].includes(v)) return "read";
  if (["failed", "error", "undelivered"].includes(v)) return "failed";
  return undefined;
}

// ---------- parser ----------
/**
 * Parse a SINGLE payload JSON into a normalized object.
 * `filename` is optional and only used as a hint (e.g., contains "status").
 */
export function parsePayload(raw: any, filename?: string): Normalized | null {
  // UNWRAP: many of your files wrap the real webhook body under "metaData"
  const root = raw?.metaData ?? raw;

  // 0) obvious flat "status" / filename hint at either root or metaData
  const flatStatusId = first(
    root?.meta_msg_id, root?.message_id, root?.messageId, root?.id,
    raw?.meta_msg_id, raw?.message_id, raw?.messageId, raw?.id
  );
  const flatStatusVal = normStatus(first(root?.status, root?.message_status, raw?.status, raw?.message_status));
  const looksLikeStatus =
    Boolean(flatStatusId && flatStatusVal) ||
    (filename?.toLowerCase().includes("status") && (flatStatusVal || flatStatusId));
  if (looksLikeStatus && flatStatusId) {
    return { kind: "status", meta_msg_id: String(flatStatusId), status: (flatStatusVal ?? "delivered") as any };
  }

  // 1) simple flat "message" (at root or metaData)
  const flat_wa_id = first(
    root?.wa_id, root?.from, root?.sender?.id, root?.user, root?.phone, root?.number, root?.msisdn,
    raw?.wa_id,  raw?.from,  raw?.sender?.id,  raw?.user,  raw?.phone,  raw?.number,  raw?.msisdn
  );
  const flat_text = first(
    root?.text, root?.message?.text, root?.message?.text?.body, root?.body, root?.content?.text, root?.msg,
    raw?.text,  raw?.message?.text,  raw?.message?.text?.body,  raw?.body,  raw?.content?.text,  raw?.msg
  );
  if (flat_wa_id) {
    return {
      kind: "message",
      doc: {
        wa_id: String(flat_wa_id),
        name: first<string>(root?.name, root?.contact_name, root?.profile?.name, raw?.name, raw?.contact_name, raw?.profile?.name),
        direction: root?.direction === "outgoing" || raw?.direction === "outgoing" ? "outgoing" : "incoming",
        type: "text",
        text: flat_text,
        timestamp: asDate(first(root?.timestamp, root?.ts, root?.created_at, root?.sent_at, raw?.timestamp, raw?.ts)),
        meta_msg_id: first(root?.meta_msg_id, root?.id, root?.message_id, root?.messageId, raw?.meta_msg_id, raw?.id),
        status: normStatus(first(root?.status, raw?.status)),
      },
    };
  }

  // 2) Meta/Webhook style: entry[].changes[] (in root) and also root.changes[]
  const entries = Array.isArray(root?.entry) ? root.entry : [];
  const allChanges = entries.flatMap((e: any) => (Array.isArray(e?.changes) ? e.changes : []));
  const rootChanges = Array.isArray(root?.changes) ? root.changes : [];
  const changes = [...allChanges, ...rootChanges];

  // some payloads put data inside change.value, others directly on change
  const normalizedChanges = changes.map((c: any) => (c?.value ? { ...c, ...c.value } : c));

  // Check for statuses first (status-only payloads), then messages
  const statusesChange = normalizedChanges.find((c: any) => Array.isArray(c?.statuses));
  if (statusesChange?.statuses?.length) {
    const s = statusesChange.statuses[0];
    const id = first(s?.meta_msg_id, s?.id, s?.message_id, s?.messageId);
    const st = normStatus(s?.status);
    if (id && st) {
      return { kind: "status", meta_msg_id: String(id), status: st };
    }
  }

  const messagesChange = normalizedChanges.find((c: any) => Array.isArray(c?.messages));
  if (messagesChange?.messages?.length) {
    const m = messagesChange.messages[0];
    const contact = messagesChange.contacts?.[0];
    const wa =
      first(contact?.wa_id, contact?.waId, contact?.waid, contact?.phone) ??
      first(m?.from, m?.recipient_id, m?.to);
    const text = first(
      m?.text?.body,
      m?.button?.text,
      m?.interactive?.body?.text,
      m?.interactive?.button_reply?.title,
      m?.interactive?.list_reply?.title
    );
    return {
      kind: "message",
      doc: {
        wa_id: String(wa ?? ""),
        name: first(contact?.profile?.name, contact?.name),
        direction: "incoming",
        type: "text",
        text,
        timestamp: asDate(first(m?.timestamp, messagesChange?.timestamp)),
        meta_msg_id: m?.id,
        status: undefined,
      },
    };
  }

  // Fallback: value object directly under root/metaData
  const valueDirect = root?.value ?? root?.entry?.[0]?.value ?? root?.changes?.[0]?.value;
  if (valueDirect?.statuses?.length) {
    const s = valueDirect.statuses[0];
    const id = first(s?.meta_msg_id, s?.id, s?.message_id, s?.messageId);
    const st = normStatus(s?.status);
    if (id && st) return { kind: "status", meta_msg_id: String(id), status: st };
  }
  if (valueDirect?.messages?.length) {
    const m = valueDirect.messages[0];
    const contact = valueDirect.contacts?.[0];
    const wa = first(contact?.wa_id, contact?.phone) ?? first(m?.from, m?.recipient_id, m?.to);
    const text = first(
      m?.text?.body,
      m?.button?.text,
      m?.interactive?.body?.text,
      m?.interactive?.button_reply?.title,
      m?.interactive?.list_reply?.title
    );
    return {
      kind: "message",
      doc: {
        wa_id: String(wa ?? ""),
        name: first(contact?.profile?.name, contact?.name),
        direction: "incoming",
        type: "text",
        text,
        timestamp: asDate(first(m?.timestamp, valueDirect?.timestamp)),
        meta_msg_id: m?.id,
        status: undefined,
      },
    };
  }

  return null;
}

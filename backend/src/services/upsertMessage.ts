import Message from "../models/Message.js";
import { emitNewMessage } from "../ws.js";

/**
 * Upserts a message using either message_id or meta_msg_id as the key.
 * Emits a "message:new" socket event when a message is inserted/updated.
 */
export async function upsertMessage(doc: any) {
  // choose the unique selector
  const query = doc.message_id
    ? { message_id: doc.message_id }
    : doc.meta_msg_id
    ? { meta_msg_id: doc.meta_msg_id }
    : null;

  if (!query) throw new Error("No message_id or meta_msg_id provided");

  // fields to set
  const update = {
    $setOnInsert: {
      timestamp: doc.timestamp, // only on first insert
    },
    $set: {
      wa_id: doc.wa_id,
      name: doc.name ?? null,
      direction: doc.direction,
      type: doc.type ?? "text",
      text: doc.text ?? null,
      media: doc.media ?? null,
      last_updated_at: new Date(),
    },
  };

  const saved = await Message.findOneAndUpdate(query, update, {
    upsert: true,
    new: true,
  });

  // realtime emit so UI updates instantly
  emitNewMessage(saved);

  return saved;
}

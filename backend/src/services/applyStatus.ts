import Message from "../models/Message.js";
import { emitStatusUpdate } from "../ws.js";

/**
 * Apply a status update to a message identified by either message_id or meta_msg_id.
 * Emits a "message:status" socket event after updating.
 */
export async function applyStatus(idOrMeta: string, status: string, ts: Date) {
  // find by either key
  const msg = await Message.findOne({
    $or: [{ message_id: idOrMeta }, { meta_msg_id: idOrMeta }],
  });

  if (!msg) return null;

  await Message.updateOne(
    { _id: msg._id },
    {
      $set: { status, last_updated_at: new Date() },
      $push: { status_history: { status, timestamp: ts } },
    }
  );

  // realtime emit so frontend can update ticks without polling
  emitStatusUpdate({
    id: idOrMeta,
    status,
    wa_id: msg.wa_id,
    timestamp: ts,
  });

  return true;
}

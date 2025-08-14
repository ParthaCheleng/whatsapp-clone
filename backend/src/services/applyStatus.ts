import Message from "../models/Message.js";

export async function applyStatus(meta_msg_id: string, status: string) {
  await Message.updateMany({ meta_msg_id }, { $set: { status } });
}

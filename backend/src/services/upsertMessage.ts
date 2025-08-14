import Message from "../models/Message.js";

export async function upsertMessage(doc: any) {
  if (doc.meta_msg_id) {
    await Message.updateOne(
      { meta_msg_id: doc.meta_msg_id },
      { $setOnInsert: doc },
      { upsert: true }
    );
  } else {
    await Message.create(doc);
  }
}

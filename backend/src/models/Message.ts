import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  wa_id: { type: String, required: true, index: true },
  name: String,
  direction: { type: String, enum: ["incoming", "outgoing"], required: true },
  type: { type: String, default: "text" },
  text: String,
  timestamp: { type: Date, default: Date.now, index: true },
  meta_msg_id: String,
  status: { type: String, enum: ["sent", "delivered", "read", "failed"] },
}, { collection: "processed_messages" });

export default model("Message", MessageSchema);

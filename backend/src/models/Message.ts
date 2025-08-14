import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
  message_id:   { type: String, index: true, unique: true, sparse: true, default: null },
  meta_msg_id:  { type: String, index: true, unique: true, sparse: true, default: null },
  wa_id:        { type: String, required: true, index: true },
  name:         { type: String, default: null },
  direction:    { type: String, enum: ["incoming", "outgoing"], required: true },
  type:         { type: String, enum: ["text", "image", "audio", "document", "sticker", "unknown"], default: "text" },
  text:         { type: String, default: null },
  media: {
    type: new Schema({ mime: String, url: String, caption: String }, { _id: false }),
    default: null
  },
  timestamp:    { type: Date, required: true },
  status:       { type: String, enum: [null, "sent", "delivered", "read", "failed"], default: null },
  status_history: {
    type: [new Schema({
      status:    { type: String, enum: ["sent", "delivered", "read", "failed"], required: true },
      timestamp: { type: Date, required: true }
    }, { _id: false })],
    default: []
  },
  last_updated_at:{ type: Date, default: Date.now, index: true }
}, { versionKey: false });

MessageSchema.index({ wa_id: 1, timestamp: 1 });

export default model("Message", MessageSchema, "processed_messages");

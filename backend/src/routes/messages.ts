import { Router } from "express";
import crypto from "node:crypto";
import Message from "../models/Message.js";

export const messages = Router();

messages.post("/", async (req, res) => {
  const { wa_id, text, name } = req.body || {};
  if (!wa_id || !text) return res.status(400).json({ ok: false, error: "wa_id and text required" });

  const now = new Date();
  const doc = await Message.create({
    message_id: null,
    meta_msg_id: crypto.randomUUID(),
    wa_id,
    name: name ?? null,
    direction: "outgoing",
    type: "text",
    text,
    media: null,
    timestamp: now,
    status: "sent",
    status_history: [{ status: "sent", timestamp: now }],
    last_updated_at: now
  });
  res.status(201).json(doc);
});

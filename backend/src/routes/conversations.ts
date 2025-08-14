import { Router } from "express";
import Message from "../models/Message.js";

export const conversations = Router();

conversations.get("/", async (_req, res) => {
  const latest = await Message.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: { _id: "$wa_id", last_message: { $first: "$$ROOT" } } },
    { $replaceWith: "$last_message" },
    { $sort: { last_updated_at: -1 } }
  ]);
  res.json(latest);
});

conversations.get("/:wa_id/messages", async (req, res) => {
  const { wa_id } = req.params;
  const { before } = req.query;
  const q: any = { wa_id };
  if (before) q.timestamp = { $lt: new Date(before as string) };
  const items = await Message.find(q).sort({ timestamp: -1 }).limit(50);
  res.json(items.reverse());
});

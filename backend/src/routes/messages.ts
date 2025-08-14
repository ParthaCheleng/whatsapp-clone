import { Router } from "express";
import Message from "../models/Message.js";
const router = Router();

router.get("/", async (req, res) => {
  const wa_id = req.query.wa_id as string | undefined;
  if (!wa_id) return res.status(400).json({ error: "wa_id required" });
  const rows = await Message.find({ wa_id }).sort({ timestamp: 1 }).lean();
  res.json(rows);
});

// Store a new outgoing message (Task-3)
router.post("/", async (req, res) => {
  const { wa_id, text, name } = req.body || {};
  if (!wa_id || !text) return res.status(400).json({ error: "wa_id and text required" });
  const doc = await Message.create({
    wa_id, name,
    direction: "outgoing",
    type: "text",
    text,
    timestamp: new Date(),
    status: "sent",
  });
  res.status(201).json(doc);
});

export default router;

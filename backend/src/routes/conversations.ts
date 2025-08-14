import { Router } from "express";
import Message from "../models/Message.js";
const router = Router();

// Last message per wa_id for the sidebar
router.get("/", async (_req, res) => {
  const rows = await Message.aggregate([
    { $sort: { timestamp: -1 } },
    { $group: {
      _id: "$wa_id",
      wa_id: { $first: "$wa_id" },
      name: { $first: "$name" },
      lastMessage: { $first: "$text" },
      lastTimestamp: { $first: "$timestamp" },
      lastStatus: { $first: "$status" },
    }},
    { $sort: { lastTimestamp: -1 } }
  ]);
  res.json(rows);
});

export default router;

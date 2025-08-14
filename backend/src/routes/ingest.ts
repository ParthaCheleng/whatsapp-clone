import { Router } from "express";
import { parsePayload } from "../utils/parsePayload.js";
import { upsertMessage } from "../services/upsertMessage.js";
import { applyStatus } from "../services/applyStatus.js";

export const ingest = Router();

ingest.post("/", async (req, res) => {
  try {
    const parsed = parsePayload(req.body);
    for (const item of parsed) {
      if (item.kind === "message") await upsertMessage(item.data);
      else await applyStatus(item.data.id, item.data.status, item.data.ts);
    }
    res.json({ ok: true, handled: parsed.length });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "ingest failed" });
  }
});

// src/scripts/ingest.ts
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { globSync } from "glob";

import { parsePayload, type Normalized } from "../utils/parsePayload.js";
import { upsertMessage } from "../services/upsertMessage.js";
import { applyStatus } from "../services/applyStatus.js";

dotenv.config();

// Run from backend/ ; payloads are in backend/payloads
const PAYLOAD_DIR = path.resolve(process.cwd(), "payloads");

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set in backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  console.log("Reading payloads from:", PAYLOAD_DIR);

  const files = globSync("**/*.json", { cwd: PAYLOAD_DIR, nodir: true });
  console.log(`Found ${files.length} payload file(s)`);

  let inserted = 0;
  let statuses = 0;
  let skipped = 0;
  const debugSkips: Array<{ file: string; keys: string[]; sample: any }> = [];

  for (const f of files) {
    try {
      const abs = path.join(PAYLOAD_DIR, f);
      const raw = JSON.parse(await fs.readFile(abs, "utf8"));
      const normalized: Normalized | null = parsePayload(raw, f);

      if (!normalized) {
        skipped++;
        if (debugSkips.length < 5) {
          debugSkips.push({
            file: f,
            keys: Object.keys(raw || {}),
            sample: Array.isArray(raw) ? raw[0] : raw,
          });
        }
        continue;
      }

      if (normalized.kind === "message") {
        if (!normalized.doc.wa_id) {
          skipped++;
          if (debugSkips.length < 5) {
            debugSkips.push({
              file: f,
              keys: Object.keys(raw || {}),
              sample: Array.isArray(raw) ? raw[0] : raw,
            });
          }
          continue;
        }
        await upsertMessage(normalized.doc);
        inserted++;
      } else {
        await applyStatus(normalized.meta_msg_id, normalized.status);
        statuses++;
      }
    } catch (e) {
      skipped++;
      if (debugSkips.length < 5) {
        debugSkips.push({ file: f, keys: [], sample: String(e) });
      }
    }
  }

  console.log(
    `Ingest complete. Messages upserted: ${inserted}, statuses applied: ${statuses}, skipped: ${skipped}`
  );
  if (debugSkips.length) {
    console.log("\n— Debug (first few skipped files) —");
    for (const d of debugSkips) {
      console.log(`File: ${d.file}`);
      console.log(`Keys: ${d.keys.join(", ")}`);
      console.log("Sample:", JSON.stringify(d.sample, null, 2));
      console.log("------");
    }
  }

  await mongoose.disconnect();
  console.log("Disconnected");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

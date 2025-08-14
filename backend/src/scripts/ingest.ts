import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import axios from "axios";

const dir = process.argv[2] || "./payloads";
const api = process.env.API_URL || "http://localhost:8080/api/ingest";

const files = fs.readdirSync(dir).filter(f => f.endsWith(".json"));
for (const f of files) {
  const payload = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
  await axios.post(api, payload);
  console.log("Ingested", f);
}

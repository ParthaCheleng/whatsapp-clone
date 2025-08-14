import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";

import { connectDB } from "./db.js";
import { ingest } from "./routes/ingest.js";
import { conversations } from "./routes/conversations.js";
import { messages } from "./routes/messages.js";
import { initIO } from "./ws.js"; // <-- Socket.IO bootstrap

const app = express();

// middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
  })
);

// health
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/api/ingest", ingest);
app.use("/api/conversations", conversations);
app.use("/api/messages", messages);

const PORT = Number(process.env.PORT || 8080);

(async () => {
  await connectDB(process.env.MONGO_URI!);

  // attach socket.io
  const server = http.createServer(app);
  initIO(server, process.env.CORS_ORIGIN?.split(",") ?? "*");

  server.listen(PORT, () => {
    console.log(`API running on :${PORT}`);
  });
})();

console.log("Connecting to Mongo…", (process.env.MONGO_URI || "").slice(0, 60) + "…");


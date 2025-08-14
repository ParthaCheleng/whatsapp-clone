import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import conversations from "./routes/conversations.js";
import messages from "./routes/messages.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/conversations", conversations);
app.use("/api/messages", messages);
app.get("/health", (_req,res)=>res.json({ ok: true }));

const PORT = process.env.PORT || 8080;

mongoose.connect(process.env.MONGO_URI!)
  .then(() => app.listen(PORT, () => console.log(`API listening on :${PORT}`)))
  .catch((e) => { console.error("Mongo connect failed", e); process.exit(1); });

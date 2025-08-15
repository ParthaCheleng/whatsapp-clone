// src/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import apiRoutes from "./routes/index"; // no `.js` when using CommonJS tsconfig

const app = express();

/**
 * --- CORS configuration ---
 * Accepts:
 *   - CORS_ORIGIN=https://your-frontend.vercel.app
 *   - CORS_ORIGIN=https://a.com,https://b.com (comma-separated)
 * In addition, local Vite dev origins are whitelisted.
 */
const localOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const envOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const allowed = new Set<string>([...localOrigins, ...envOrigins]);

app.use(
  cors({
    origin(origin, cb) {
      // Allow server-to-server / curl / same-origin (no Origin header)
      if (!origin) return cb(null, true);

      // Exact allow-list match?
      if (allowed.has(origin)) return cb(null, true);

      // Allow Vercel preview deploys if you want (uncomment to enable):
      // if (/\.vercel\.app$/.test(origin)) return cb(null, true);

      // Otherwise, block
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: false, // set true only if you need cookies/auth headers
  })
);

app.use(express.json());

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// Mount API routes
app.use("/api", apiRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Not Found" });
});

// Error handler (keeps JSON shape consistent)
app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("[ERROR]", err);
    const message =
      err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({ error: "Internal Server Error", message });
  }
);

const port = Number(process.env.PORT) || 8080;
app.set("trust proxy", true);
app.listen(port, () => {
  console.log(`API listening on :${port}`);
  console.log("Allowed CORS origins:", Array.from(allowed).join(", ") || "(none)");
});

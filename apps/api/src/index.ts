import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import fs from "fs";
import chatRoutes from "./routes/chat.js";
import partsRoutes from "./routes/parts.js";
import sessionsRoutes from "./routes/sessions.js";
import scrapeRoutes from "./routes/scrape.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "256kb" }));

const requestCounts = new Map<string, { count: number; resetAt: number }>();
app.use((req, res, next) => {
  const now = Date.now();
  const clientKey = req.ip || req.socket.remoteAddress || "unknown";
  const current = requestCounts.get(clientKey);
  if (!current || current.resetAt <= now) {
    requestCounts.set(clientKey, { count: 1, resetAt: now + 60_000 });
    next();
    return;
  }
  if (current.count >= 120) {
    res.status(429).json({ error: "Too many requests" });
    return;
  }
  current.count += 1;
  next();
});

app.use("/api", chatRoutes);
app.use("/api", partsRoutes);
app.use("/api", sessionsRoutes);
app.use("/api", scrapeRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/parts", express.static(path.resolve(__dirname, "../../web/public/parts")));

const webDist = path.resolve(__dirname, "../../web/dist");
if (fs.existsSync(webDist)) {
  app.use(express.static(webDist));
  app.get(/^\/(?!api|health).*/, (_req, res) => {
    res.sendFile(path.join(webDist, "index.html"));
  });
  console.log(`🌐 Serving web app from ${webDist}`);
}

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Decksmith API running on http://0.0.0.0:${PORT}`);
});

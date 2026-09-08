import express from "express";
import cors from "cors";
import { api } from "./routes/index.js";

export const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL ?? "http://localhost:5174" }));
app.use(express.json({ limit: "100kb" }));
app.use("/api", api);
app.use((_req, res) => res.status(404).json({ message: "That route drifted into deep space." }));
app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);
  res.status(500).json({ message: "Unexpected cosmic turbulence." });
});

import "dotenv/config";
import { app } from "./app.js";
import { pool } from "./db/pool.js";
import { initializeDatabase } from "./db/initialize.js";

const port = Number(process.env.PORT) || 3001;
await initializeDatabase();
const server = app.listen(port, () => console.log(`Galactic API listening on http://localhost:${port}`));

async function shutdown() {
  server.close();
  await pool.end();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

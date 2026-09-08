import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";
import { seed } from "./seed.js";

export async function initializeDatabase() {
  const schemaPath = fileURLToPath(new URL("./schema.sql", import.meta.url));
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(await readFile(schemaPath, "utf8"));
    await seed(client);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally { client.release(); }
}

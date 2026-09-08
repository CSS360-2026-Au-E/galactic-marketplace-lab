import { pool } from "./pool.js";
import { initializeDatabase } from "./initialize.js";

try {
  await initializeDatabase();
  console.log("Database ready for intergalactic commerce.");
} finally {
  await pool.end();
}

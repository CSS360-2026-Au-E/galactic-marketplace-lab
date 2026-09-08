import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
dotenv.config({ path: fileURLToPath(new URL("../../../.env", import.meta.url)) });

export const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/galactic_marketplace" });

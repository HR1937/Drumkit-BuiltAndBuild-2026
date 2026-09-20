import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Pool } = pg;
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const root = path.dirname(fileURLToPath(import.meta.url));
const migrationDir = path.join(root, "../migrations");
const files = (await fs.readdir(migrationDir)).filter((name) => /^\d+_.*\.sql$/.test(name)).sort();
for (const file of files) {
  const sql = await fs.readFile(path.join(migrationDir, file), "utf8");
  await pool.query("BEGIN");
  try { await pool.query(sql); await pool.query("COMMIT"); console.log(`Applied ${file}`); }
  catch (error) { await pool.query("ROLLBACK"); throw error; }
}
await pool.end();
console.log(`Breeze migrations applied: ${files.length}`);

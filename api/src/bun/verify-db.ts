import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const tables = await pool.query("select table_name from information_schema.tables where table_schema='public' and table_type='BASE TABLE' order by table_name");
const fk = await pool.query("select confdeltype from pg_constraint where conname='report_run_report_id_fkey'");
const indexes = await pool.query("select count(1)::int n from pg_indexes where schemaname='public'");
console.log(JSON.stringify({ tableCount: tables.rowCount, tables: tables.rows.map((row) => row.table_name), reportRunDeleteAction: fk.rows[0]?.confdeltype, indexCount: indexes.rows[0]?.n }));
await pool.end();

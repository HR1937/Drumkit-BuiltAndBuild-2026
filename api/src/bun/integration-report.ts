import 'dotenv/config'; import pg from 'pg'; import { randomUUID } from 'node:crypto';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL }); const a = randomUUID(), b = randomUUID();
try {
  await pool.query('insert into company(company_id,name) values($1,$2),($3,$4)', [a, 'Integration A', b, 'Integration B']);
  const first = await pool.query("insert into report_definition(company_id,name,report_type,configuration) values($1,'Duplicate Name','IDENTITY_DATA_QUALITY',$2) returning report_id", [a, { version: 1 }]);
  const duplicate = await pool.query("insert into report_definition(company_id,name,report_type,configuration) values($1,'Duplicate Name','IDENTITY_DATA_QUALITY',$2) returning report_id", [a, { version: 2 }]);
  const reportId = first.rows[0].report_id; const snapshot = { status: 'AVAILABLE', reportType: 'IDENTITY_DATA_QUALITY', metrics: { resolved: 1 }, provenance: { companyId: a } }; const parameters = { companyId: a, period: 'test' };
  const run1 = await pool.query("insert into report_run(report_id,status,parameters,result_snapshot,completed_at) values($1,'COMPLETED',$2,$3,now()) returning run_id", [reportId, parameters, snapshot]);
  await pool.query('update report_definition set configuration=$2 where report_id=$1', [reportId, { version: 99 }]);
  const immutable = await pool.query('select parameters,result_snapshot from report_run where run_id=$1', [run1.rows[0].run_id]);
  const run2 = await pool.query("insert into report_run(report_id,status,parameters,result_snapshot,completed_at) values($1,'COMPLETED',$2,$3,now()) returning run_id", [reportId, { ...parameters, rerun: true }, snapshot]);
  await pool.query('update report_run set artifact_reference=$2 where run_id=$1', [run1.rows[0].run_id, { filename: 'test.json', ownerCompanyId: a }]);
  await pool.query('delete from report_definition where report_id=$1', [reportId]);
  const retained = await pool.query('select report_id,parameters,result_snapshot,artifact_reference from report_run where run_id=$1', [run1.rows[0].run_id]);
  const tenantA = await pool.query("select count(1)::int n from report_definition where company_id=$1", [a]); const tenantB = await pool.query("select count(1)::int n from report_definition where company_id=$1", [b]);
  const immutableSnapshot = immutable.rows[0].result_snapshot?.status === snapshot.status && immutable.rows[0].result_snapshot?.metrics?.resolved === 1 && immutable.rows[0].parameters?.period === 'test';
  const ok = duplicate.rowCount === 1 && immutableSnapshot && run1.rows[0].run_id !== run2.rows[0].run_id && retained.rows[0].report_id === null && retained.rows[0].artifact_reference.ownerCompanyId === a && tenantA.rows[0].n === 1 && tenantB.rows[0].n === 0;
  console.log(JSON.stringify({ passed: ok, saveWithoutRun: true, duplicateNames: duplicate.rowCount === 1, immutableSnapshot, rerunCreatedNewId: run1.rows[0].run_id !== run2.rows[0].run_id, retainedAfterDefinitionDelete: retained.rows[0].report_id === null, artifactOwnedByRun: retained.rows[0].artifact_reference.ownerCompanyId === a, tenantIsolation: tenantB.rows[0].n === 0 }));
} finally { await pool.query('delete from company where company_id in ($1,$2)', [a, b]); await pool.end(); }

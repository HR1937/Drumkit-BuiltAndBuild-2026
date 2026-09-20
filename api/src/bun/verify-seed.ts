import 'dotenv/config'; import pg from 'pg';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const names = ['company','data_source','customer','identity_mapping','event','identity_resolution','journey_definition','journey_stage_definition','journey_instance','issue','complaint','escalation','churn_outcome','report_definition'];
const counts: Record<string, number> = {}; for (const name of names) counts[name] = Number((await pool.query(`select count(1) n from ${name}`)).rows[0].n);
const quality = await pool.query("select status,count(1)::int n from identity_resolution group by status order by status");
const scenarios = await pool.query(`
  select
    exists(select 1 from identity_resolution r join event e on e.event_id=r.event_id where e.source_event_id='identity-ambiguous' and r.status='AMBIGUOUS' and r.c_id is null) ambiguous,
    exists(select 1 from identity_resolution r join event e on e.event_id=r.event_id where e.source_event_id='identity-unresolved' and r.status='UNRESOLVED') unresolved,
    exists(select 1 from journey_instance where company_id='10000000-0000-4000-8000-000000000001' and entity_id='completed-1' and status='COMPLETED') completed,
    exists(select 1 from journey_instance where company_id='10000000-0000-4000-8000-000000000001' and entity_id='abandoned-1' and status='ABANDONED') abandoned,
    exists(select 1 from journey_instance where company_id='10000000-0000-4000-8000-000000000001' and entity_id='late-1' and status='COMPLETED' and dropped_off_at is null and dropoff_stage_id is null) late_corrected,
    exists(select 1 from issue where company_id='10000000-0000-4000-8000-000000000001' and topic='delivery delay' and status='REOPENED') issue_reopened,
    exists(select 1 from escalation where company_id='10000000-0000-4000-8000-000000000001' and detection_method='INFERRED' and confidence is not null) inferred_escalation,
    exists(select 1 from churn_outcome where company_id='10000000-0000-4000-8000-000000000001') structured_churn
`);
const ok = Object.values(scenarios.rows[0]).every(Boolean) && quality.rows.some((row) => row.status === 'AMBIGUOUS') && quality.rows.some((row) => row.status === 'UNRESOLVED');
if (!ok) throw new Error(`Seed scenario verification failed: ${JSON.stringify(scenarios.rows[0])}`);
console.log(JSON.stringify({ passed: true, counts, identity: quality.rows, scenarios: scenarios.rows[0] })); await pool.end();

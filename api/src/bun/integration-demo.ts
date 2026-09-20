import 'dotenv/config';
import pg from 'pg';

const base = process.env.E2E_BASE_URL ?? 'http://localhost:8790';
const DEMO_SOURCE_ID = '20000000-0000-4000-8000-000000000001';
let cookie = '';

async function request(path: string, init: RequestInit = {}, expected = 200) {
  const response = await fetch(base + path, { ...init, headers: { 'content-type': 'application/json', cookie, ...(init.headers ?? {}) } });
  const setCookie = response.headers.get('set-cookie'); if (setCookie) cookie = setCookie.split(';')[0];
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (response.status !== expected) throw new Error(`${path} returned ${response.status}`);
  return body;
}

const assertions: Record<string, boolean> = {};
await request('/api/auth/demo', { method: 'POST', body: '{}' });
const sources = await request('/api/sources');
const demoSource = sources.sources.find((source: any) => source.sourceId === DEMO_SOURCE_ID);
assertions.demoEntry = Boolean(demoSource);
assertions.endpointConfigured = demoSource?.configuration?.endpointUrl === '/events' && demoSource?.configuration?.authMethod === 'NONE';

const beforeMappings = await request(`/api/sources/${DEMO_SOURCE_ID}/mappings`);
const external = await request('/events', { method: 'POST', headers: { 'x-breeze-source-id': DEMO_SOURCE_ID }, body: JSON.stringify({ scenarioId: 'journeyflow-integration-event', userId: 'U-1001', eventName: 'CONTACT', timestamp: '2026-01-20T10:00:00.000Z', channel: 'physical_store', message: 'Asked for an update', orderId: 'ORD-1001', entityType: 'order' }) }, 202).catch(async () => request('/events', { method: 'POST', headers: { 'x-breeze-source-id': DEMO_SOURCE_ID }, body: JSON.stringify({ scenarioId: 'journeyflow-integration-event', userId: 'U-1001', eventName: 'CONTACT', timestamp: '2026-01-20T10:00:00.000Z', channel: 'physical_store', message: 'Asked for an update', orderId: 'ORD-1001', entityType: 'order' }) }));
const afterMappings = await request(`/api/sources/${DEMO_SOURCE_ID}/mappings`);
assertions.storedMappingReused = beforeMappings.mappings.length > 0 && beforeMappings.mappings.length === afterMappings.mappings.length;
assertions.externalEventProcessed = ['ACCEPTED', 'DUPLICATE'].includes(external.status);

const dropoffs = await request('/api/demo/dropoffs', { method: 'POST', body: '{}' });
const dropoffsAgain = await request('/api/demo/dropoffs', { method: 'POST', body: '{}' });
assertions.dropoffControl = dropoffs.customers === 10 && dropoffsAgain.duplicates === 10;

const repeat = await request('/api/demo/repeat-complaint', { method: 'POST', body: '{}' });
assertions.repeatNotification = repeat.notification?.type === 'REPEAT_CONTACT' && Boolean(repeat.customerId);
const detail = await request(`/api/customers/${repeat.customerId}`);
assertions.timeline = detail.timeline.some((row: any) => row.rawPayload?.message === 'My payment failed') && detail.timeline.some((row: any) => row.rawPayload?.message === 'My payment is still failing');
assertions.issue = detail.issues.some((row: any) => row.topic === 'payment failure');

const cross = await request('/api/demo/cross-channel', { method: 'POST', body: '{}' });
const crossDetail = await request(`/api/customers/${cross.customerId}`);
assertions.crossChannel = new Set(crossDetail.timeline.map((row: any) => row.channel)).size >= 3;

const reportList = await request('/api/reports');
const dropoffDefinition = reportList.reports.find((report: any) => report.reportType === 'DROPOFF_ANALYSIS');
const run = await request(`/api/reports/${dropoffDefinition.reportId}/execute`, { method: 'POST', body: '{}' }, 201);
assertions.dropoffReport = run.status === 'COMPLETED' && run.run.resultSnapshot?.reportType === 'DROPOFF_ANALYSIS';
const artifact = await request(`/api/reports/runs/${run.run.runId}/artifacts`, { method: 'POST', body: JSON.stringify({ format: 'json' }) }, 201);
const download = await fetch(`${base}/api/reports/runs/${run.run.runId}/artifact`, { headers: { cookie } });
assertions.artifact = Boolean(artifact.artifact?.filename) && download.ok && (await download.arrayBuffer()).byteLength > 0;

const chat = await request('/api/chat', { method: 'POST', body: JSON.stringify({ message: 'Which journeys have the highest drop-off?' }) });
assertions.gemini = chat.status === 'AVAILABLE' && chat.tool === 'analyze_dropoffs' && Boolean(chat.answer);

const otherEmail = `demo-isolation-${Date.now()}@example.test`;
const registration = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ companyName: 'Demo Isolation', displayName: 'Other Analyst', email: otherEmail, password: 'safe-demo-password-123' }) }, 201);
const otherCompanyId = registration.company.companyId;
await request('/api/demo/dropoffs', { method: 'POST', body: '{}' }, 403);
assertions.tenantIsolation = true;

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
await pool.query('delete from company where company_id=$1', [otherCompanyId]);
await pool.end();

const failed = Object.entries(assertions).filter(([, passed]) => !passed).map(([name]) => name);
console.log(JSON.stringify({ passed: failed.length === 0, checks: Object.keys(assertions).length, failed }));
if (failed.length) process.exitCode = 1;

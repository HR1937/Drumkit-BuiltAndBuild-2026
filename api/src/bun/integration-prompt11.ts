import 'dotenv/config';
import pg from 'pg';
import { randomUUID } from 'node:crypto';

const base = process.env.E2E_BASE_URL ?? 'http://localhost:8791';
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const password = 'prompt-11-secure-password';
const emailA = `prompt11-a-${Date.now()}@example.test`, emailB = `prompt11-b-${Date.now()}@example.test`;
let cookieA = '', cookieB = '';
const request = async (path: string, init: RequestInit = {}, tenant: 'A' | 'B' = 'A', allowError = false) => {
  const cookie = tenant === 'A' ? cookieA : cookieB;
  const response = await fetch(base + path, { ...init, headers: { 'content-type': 'application/json', cookie, ...(init.headers ?? {}) } });
  const set = response.headers.get('set-cookie'); if (set) tenant === 'A' ? cookieA = set.split(';')[0] : cookieB = set.split(';')[0];
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!allowError && !response.ok) throw new Error(`${path}:${response.status}:${JSON.stringify(body)}`);
  return { response, body };
};
const assert = (condition: unknown, message: string) => { if (!condition) throw new Error(message); };
let companyA: string | null = null, companyB: string | null = null;

try {
  const registrationA = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ companyName: 'Prompt 11 A', displayName: 'Admin A', email: emailA, password }) }); companyA = registrationA.body.company.companyId;
  const duplicate = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ companyName: 'Duplicate', displayName: 'Admin', email: emailA, password }) }, 'A', true); assert(duplicate.response.status === 409, 'duplicate email was accepted');
  const invalidLogin = await request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: emailA, password: 'wrong-password' }) }, 'A', true); assert(invalidLogin.response.status === 401, 'invalid login was accepted');
  const me = await request('/api/me'); assert(me.body.account.companyId === companyA, 'session company context mismatch');
  const registrationB = await request('/api/auth/register', { method: 'POST', body: JSON.stringify({ companyName: 'Prompt 11 B', displayName: 'Admin B', email: emailB, password }) }, 'B'); companyB = registrationB.body.company.companyId;

  const source = await request('/api/sources', { method: 'POST', body: JSON.stringify({ name: 'Prompt 11 events', sourceType: 'EVENT_API', connectionMethod: 'REST_API', channel: 'WEB' }) }); const sourceId = source.body.source.sourceId;
  await pool.query("update data_source set status='ACTIVE' where source_id=$1 and company_id=$2", [sourceId, companyA]);
  await request(`/api/sources/${sourceId}/mappings`, { method: 'PUT', body: JSON.stringify({ mappings: [{ sourceField: 'custom_kind', semanticField: 'event_type' }] }) });
  const customerId = randomUUID(), retainedId = randomUUID();
  await pool.query('insert into customer(c_id,company_id,display_name) values($1,$2,$3),($4,$2,$5)', [customerId, companyA, 'Integrated Customer', retainedId, 'Retained Customer']);
  await pool.query('insert into identity_mapping(company_id,source_id,identifier_type,identifier_value,c_id) values($1,$2,$3,$4,$5)', [companyA, sourceId, 'email', 'integrated@example.test', customerId]);
  await request('/api/config/journeys', { method: 'POST', body: JSON.stringify({ name: 'Integrated Journey', configuration: { startEventType: 'JOURNEY_START', completionEventType: 'JOURNEY_COMPLETE', abandonmentEventType: 'JOURNEY_ABANDONED' }, stages: [{ key: 'start', name: 'Started', required: true, timeoutSeconds: 3600, eventTypes: ['JOURNEY_START'] }, { key: 'complete', name: 'Completed', required: true, eventTypes: ['JOURNEY_COMPLETE'] }] }) });
  const now = Date.now();
  const ingest = (payload: Record<string, unknown>) => request('/api/events', { method: 'POST', body: JSON.stringify({ sourceId, ...payload }) });
  const mappedEvent = await request('/api/events', { method: 'POST', body: JSON.stringify({ sourceId, sourceEventId: 'p11-mapped', custom_kind: 'CONTACT', eventTime: new Date(now - 4200000).toISOString(), customerId, channel: 'WEB' }) }); assert(mappedEvent.body.status === 'ACCEPTED', 'source field mapping did not normalize ingestion');
  const first = await ingest({ sourceEventId: 'p11-start', eventType: 'JOURNEY_START', eventTime: new Date(now - 3600000).toISOString(), channel: 'WEB', identifiers: { email: 'integrated@example.test' }, entityType: 'case', entityId: 'P11-1' }); assert(first.body.identity === 'RESOLVED', 'ingestion identity did not resolve');
  await ingest({ sourceEventId: 'p11-complaint-1', eventType: 'COMPLAINT', eventTime: new Date(now - 3000000).toISOString(), channel: 'CALL_CENTER', customerId, topic: 'service delay', entityType: 'case', entityId: 'P11-1' });
  await ingest({ sourceEventId: 'p11-complaint-2', eventType: 'COMPLAINT', eventTime: new Date(now - 2400000).toISOString(), channel: 'CALL_CENTER', customerId, topic: 'service delay', entityType: 'case', entityId: 'P11-1', supervisorTransfer: true, reason: 'requested supervisor' });
  await ingest({ sourceEventId: 'p11-complete', eventType: 'JOURNEY_COMPLETE', eventTime: new Date(now - 1800000).toISOString(), channel: 'APP', customerId, entityType: 'case', entityId: 'P11-1' });
  const duplicateEvent = await ingest({ sourceEventId: 'p11-complete', eventType: 'JOURNEY_COMPLETE', eventTime: new Date(now - 1800000).toISOString(), channel: 'APP', customerId }); assert(duplicateEvent.body.status === 'DUPLICATE', 'duplicate event was not deduplicated');
  await request(`/api/customers/${customerId}/churn`, { method: 'POST', body: JSON.stringify({ churnType: 'CONFIGURED_CANCELLATION', churnTimestamp: new Date(now - 600000).toISOString(), source: 'structured-test', sourceReference: 'p11-churn' }) });

  const detail = await request(`/api/customers/${customerId}`); assert(detail.body.timeline.length >= 4 && detail.body.issues.length >= 1 && detail.body.escalations.length >= 1 && detail.body.journeys.length >= 1 && detail.body.churn.length === 1, 'customer detail is not integrated');
  const overview = await request('/api/analytics/overview'); assert(overview.body.metrics.customers >= 2 && overview.body.metrics.events >= 4, 'dashboard analytics are not database backed');

  const report = await request('/api/reports', { method: 'POST', body: JSON.stringify({ name: 'Prompt 11 Journey', reportType: 'CUSTOMER_JOURNEY_OVERVIEW', configuration: {} }) });
  const run = await request(`/api/reports/${report.body.report.reportId}/execute`, { method: 'POST', body: '{}' }); const runId = run.body.run.runId; assert(run.body.status === 'COMPLETED', 'report did not complete');
  const artifact = await request(`/api/reports/runs/${runId}/artifacts`, { method: 'POST', body: JSON.stringify({ format: 'pdf' }) });
  const download = await fetch(`${base}/api/reports/runs/${runId}/artifact`, { headers: { cookie: cookieA } }); assert(download.ok && (await download.arrayBuffer()).byteLength > 0 && download.headers.get('content-type') === 'application/pdf', 'artifact download failed');
  const forbiddenArtifact = await fetch(`${base}/api/reports/runs/${runId}/artifact`, { headers: { cookie: cookieB } }); assert(forbiddenArtifact.status === 404, 'cross-tenant artifact access was allowed');
  const forbiddenCustomer = await request('/api/mcp/get_customer_profile', { method: 'POST', body: JSON.stringify({ customerId }) }, 'B', true); assert(forbiddenCustomer.response.status === 404, 'cross-tenant MCP customer access was allowed');

  const chatCases = [
    { request: 'Give me this customer profile.', customerId, allowed: ['get_customer_profile'] },
    { request: 'What happened in this customer timeline?', customerId, allowed: ['get_customer_timeline', 'get_customer_journeys'] },
    { request: 'Which journeys have significant drop-offs?', allowed: ['analyze_dropoffs'] },
    { request: 'Analyze repeat contacts for this company.', allowed: ['analyze_repeat_contacts'] },
    { request: 'What experiences are associated with churn? Do not claim causation.', allowed: ['analyze_churn_associations'] },
    { request: 'How good is our identity resolution and data quality?', allowed: ['analyze_identity_resolution', 'get_data_quality'] }
  ];
  const chats = [];
  for (const item of chatCases) {
    const response = await request('/api/chat', { method: 'POST', body: JSON.stringify({ message: item.request, ...(item.customerId ? { customerId: item.customerId } : {}) }) });
    assert(response.body.status === 'AVAILABLE' && item.allowed.includes(response.body.tool) && response.body.result?.provenance && typeof response.body.answer === 'string', `Gemini grounding failed for: ${item.request}`);
    if (item.request.includes('associated with churn')) assert(!/\bcaused?\b/i.test(response.body.answer), 'Gemini made a causal churn claim');
    chats.push({ request: item.request, tool: response.body.tool, resultStatus: response.body.result.status, answer: response.body.answer });
  }

  await request('/api/auth/logout', { method: 'POST' }); const afterLogout = await request('/api/me', {}, 'A', true); assert(afterLogout.response.status === 401, 'logout did not invalidate session');
  console.log(JSON.stringify({ passed: true, auth: { registration: true, duplicateEmail: duplicate.response.status, invalidLogin: invalidLogin.response.status, logout: afterLogout.response.status }, onboarding: true, ingestion: { mapped: mappedEvent.body.status, resolved: first.body.identity, duplicate: duplicateEvent.body.status }, customerDetail: { timeline: detail.body.timeline.length, issues: detail.body.issues.length, escalations: detail.body.escalations.length, journeys: detail.body.journeys.length, churn: detail.body.churn.length }, dashboard: overview.body.metrics, report: { status: run.body.status, runId, artifact: artifact.body.artifact.filename, contentType: download.headers.get('content-type') }, tenantIsolation: { artifact: forbiddenArtifact.status, mcp: forbiddenCustomer.response.status }, gemini: chats }));
} finally {
  if (companyA) await pool.query('delete from company where company_id=$1', [companyA]);
  if (companyB) await pool.query('delete from company where company_id=$1', [companyB]);
  await pool.end();
}

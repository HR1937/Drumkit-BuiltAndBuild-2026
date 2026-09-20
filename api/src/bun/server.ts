import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { deleteCookie, getCookie, setCookie } from 'hono/cookie';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, asc, eq, or, sql as drizzleSql } from 'drizzle-orm';
import { company, customer, dataSource, sourceFieldMapping, event, identityMapping, identityResolution, journeyDefinition, journeyStageDefinition, journeyEventMapping, journeyInstance, journeyInstanceStage, issue, complaint, issueGroupingRule, escalation, churnOutcome } from '../db/schema.js';
import { evaluateJourneyEvent } from './journeys.js';
import { analyticsOverview, customerEscalations, customerIssues, customerJourneys } from './analytics.js';
import { groupComplaintIntoIssue, updateIssueStatus, normalizeComplaintTopic } from './issues.js';
import { persistEscalation } from './escalations.js';
import { analyzeChurn } from './churn.js';
import { loginAccount, logoutSession, registerAccount, resolveSession } from './auth.js';
import { artifactFilename, renderArtifact, type ArtifactFormat } from './artifacts.js';
import { executeReportAnalysis, REPORT_TYPES, type ReportType } from './reports.js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { GeminiKeyManager, parseGeminiKeys } from '../services/gemini.js';
import { validateToolCall } from '../services/orchestration.js';
import { resolveEventIdentity } from './identity.js';
import { invokeMcpTool, MCP_TOOL_NAMES } from './mcp.js';
import { normalizeSourcePayload } from './source-mapping.js';

const sql = process.env.DATABASE_URL ? postgres(process.env.DATABASE_URL, { max: 5 }) : null;
const db = sql ? drizzle(sql) : null;
let gemini: any = null; try { const keys = parseGeminiKeys(process.env.GEMINI_API_KEYS ?? '[]'); if (keys.length) gemini = new GeminiKeyManager(keys); } catch { gemini = null; }
type Variables = { auth: { accountId: string; companyId: string; email: string; displayName: string } };
const app = new Hono<{ Variables: Variables }>();

app.use('*', cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.onError((error, c) => { console.error('Breeze request failure', error instanceof Error ? error.message : 'unknown'); return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Request failed safely.' } }, 500); });

app.get('/health', async (c) => {
  let database = false;
  if (sql) {
    try { await sql`select 1`; database = true; } catch { database = false; }
  }
  return c.json({ ok: true, database, runtime: 'bun-hono', service: 'breeze-api' });
});

app.post('/api/auth/register', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const body = jsonObject(await c.req.json()); if (typeof body.companyName !== 'string' || typeof body.email !== 'string' || typeof body.password !== 'string' || typeof body.displayName !== 'string') return c.json({ status: 'INVALID_INPUT' }, 400);
  let createdCompany: any = null;
  try { [createdCompany] = await db.insert(company).values({ name: body.companyName.trim(), timezone: typeof body.timezone === 'string' ? body.timezone : 'UTC' }).returning(); const account = await registerAccount({ companyId: createdCompany.companyId, email: body.email, password: body.password, displayName: body.displayName }); const login = await loginAccount(body.email, body.password); setCookie(c, 'breeze_session', login.session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/', expires: new Date(login.session.expiresAt) }); return c.json({ status: 'AVAILABLE', account, company: createdCompany }, 201); } catch (error: any) { if (createdCompany?.companyId) await db.delete(company).where(eq(company.companyId, createdCompany.companyId)).catch(() => undefined); return c.json({ status: error.code ?? 'ERROR', message: error.code === 'DUPLICATE_EMAIL' ? 'Email is already registered.' : 'Registration failed.' }, error.code === 'DUPLICATE_EMAIL' ? 409 : 400); }
});
app.post('/api/auth/login', async (c) => { const body = jsonObject(await c.req.json()); try { const login = await loginAccount(body.email, body.password); setCookie(c, 'breeze_session', login.session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/', expires: new Date(login.session.expiresAt) }); return c.json({ status: 'AVAILABLE', account: login.account }); } catch { return c.json({ status: 'UNAUTHORIZED', message: 'Invalid email or password.' }, 401); } });
app.post('/api/auth/logout', async (c) => { await logoutSession(getCookie(c, 'breeze_session')); deleteCookie(c, 'breeze_session', { path: '/' }); return c.body(null, 204); });
app.post('/api/auth/demo', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const demoCompanyId = '10000000-0000-4000-8000-000000000001'; const email = 'demo@breeze.local'; const password = process.env.DEMO_ACCOUNT_PASSWORD ?? 'breeze-demo-workspace'; const [demoCompany] = await db.select().from(company).where(eq(company.companyId, demoCompanyId)); if (!demoCompany) return c.json({ status: 'UNAVAILABLE', message: 'Demo data is not seeded.' }, 503); try { await registerAccount({ companyId: demoCompanyId, email, password, displayName: 'Demo Analyst' }); } catch (error: any) { if (error.code !== 'DUPLICATE_EMAIL') return c.json({ status: 'ERROR' }, 500); } const login = await loginAccount(email, password); setCookie(c, 'breeze_session', login.session.token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/', expires: new Date(login.session.expiresAt) }); return c.json({ status: 'AVAILABLE', account: login.account, demo: true }); });
app.use('/api/*', async (c, next) => { if (c.req.path.startsWith('/api/auth/')) return next(); const resolved = await resolveSession(getCookie(c, 'breeze_session')); if (!resolved) return c.json({ status: 'UNAUTHORIZED' }, 401); c.set('auth', resolved.account); await next(); });
app.get('/api/me', (c) => c.json({ status: 'AVAILABLE', account: c.get('auth') }));

app.get('/api/companies/:companyId', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const [row] = await db.select({ companyId: company.companyId, name: company.name, timezone: company.timezone }).from(company).where(eq(company.companyId, c.req.param('companyId')));
  return row ? c.json({ status: 'AVAILABLE', company: row }) : c.json({ status: 'NOT_FOUND' }, 404);
});

app.get('/api/companies/:companyId/customers', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const rows = await db.select({ customerId: customer.customerId, displayName: customer.displayName, createdAt: customer.createdAt }).from(customer).where(eq(customer.companyId, c.req.param('companyId')));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', customers: rows });
});
app.get('/api/customers', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const rows = await db.select({ customerId: customer.customerId, displayName: customer.displayName, createdAt: customer.createdAt }).from(customer).where(eq(customer.companyId, companyId)).orderBy(asc(customer.createdAt)); return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', customers: rows }); });

function tenantId(c: any) {
  return c.get('auth')?.companyId;
}

function jsonObject(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

const credentialHash = (value: string) => createHash('sha256').update(value).digest('hex');
async function processExternalEvent(companyId: string, source: any, rawBody: Record<string, unknown>) {
  const configuredMappings = await db!.select({ sourceField: sourceFieldMapping.sourceField, semanticField: sourceFieldMapping.semanticField, required: sourceFieldMapping.required }).from(sourceFieldMapping).where(eq(sourceFieldMapping.sourceId, source.sourceId));
  const mapped = normalizeSourcePayload(rawBody, configuredMappings); if (mapped.missing.length) return { statusCode: 400, result: { status: 'INVALID_INPUT', fields: mapped.missing } };
  const body = mapped.normalized; if (typeof body.eventType !== 'string') return { statusCode: 400, result: { status: 'INVALID_INPUT', message: 'Mapped event_type is required.' } };
  const sourceEventId = typeof body.sourceEventId === 'string' ? body.sourceEventId : null;
  if (sourceEventId) { const [duplicate] = await db!.select({ eventId: event.eventId }).from(event).where(and(eq(event.companyId, companyId), eq(event.sourceId, source.sourceId), eq(event.sourceEventId, sourceEventId))); if (duplicate) return { statusCode: 200, result: { status: 'DUPLICATE', eventId: duplicate.eventId } }; }
  const identifiers = jsonObject(body.identifiers); const canonicalCustomerId = typeof body.customerId === 'string' ? body.customerId : null;
  const [stored] = await db!.insert(event).values({ companyId, sourceId: source.sourceId, sourceEventId, customerId: canonicalCustomerId, eventTime: body.eventTime ? new Date(String(body.eventTime)) : new Date(), channel: typeof body.channel === 'string' ? body.channel : source.channel, eventType: body.eventType, businessEntityType: typeof body.entityType === 'string' ? body.entityType : null, businessEntityId: typeof body.entityId === 'string' ? body.entityId : null, sessionId: typeof body.sessionId === 'string' ? body.sessionId : null, attributes: { ...jsonObject(body.attributes), identifiers, content: body.content ?? body.transcript ?? null }, rawPayload: rawBody, processedAt: new Date() }).returning();
  const identity = await resolveEventIdentity(db!, { companyId, eventId: stored.eventId, canonicalCustomerId, identifiers }); const customerId = identity.customerId;
  const topic = normalizeComplaintTopic(body.topic ?? body.content ?? body.message);
  let grouped: any = null; if (customerId && topic && ['COMPLAINT', 'SUPPORT_COMPLAINT', 'support_complaint'].includes(String(body.eventType))) grouped = await groupComplaintIntoIssue(db!, { companyId, customerId, eventId: stored.eventId, topic, occurredAt: stored.eventTime ?? new Date(), channel: typeof body.channel === 'string' ? body.channel : source.channel, entityId: typeof body.entityId === 'string' ? body.entityId : null });
  const escalated = customerId ? await persistEscalation(db!, { companyId, customerId, eventId: stored.eventId, issueId: grouped?.issue?.issueId, occurredAt: stored.eventTime ?? new Date(), payload: body }) : null;
  const journey = await evaluateJourneyEvent(db!, { companyId, eventId: stored.eventId, customerId, eventType: String(body.eventType), eventTime: stored.eventTime ?? new Date(), entityType: typeof body.entityType === 'string' ? body.entityType : null, entityId: typeof body.entityId === 'string' ? body.entityId : null });
  return { statusCode: 202, result: { status: 'ACCEPTED', event: stored, identity: identity.status, issue: grouped?.issue ?? null, escalation: escalated, journey } };
}

app.post('/events', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const body = jsonObject(await c.req.json()); const sourceId = typeof body.sourceId === 'string' ? body.sourceId : c.req.header('x-breeze-source-id'); if (!sourceId) return c.json({ status: 'INVALID_INPUT', message: 'sourceId is required.' }, 400);
  const [source] = await db.select().from(dataSource).where(and(eq(dataSource.sourceId, sourceId), eq(dataSource.status, 'ACTIVE'))); if (!source) return c.json({ status: 'NOT_FOUND' }, 404);
  const configuration = jsonObject(source.configuration); const method = String(configuration.authMethod ?? 'NONE'); const supplied = (c.req.header('authorization') ?? '').replace(/^Bearer\s+/i, '') || c.req.header('x-api-key') || '';
  if (method !== 'NONE' && (!source.credentialsReference || credentialHash(supplied) !== source.credentialsReference)) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const processed = await processExternalEvent(source.companyId, source, body); return c.json(processed.result as any, processed.statusCode as any);
});

app.get('/api/sources', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const companyId = tenantId(c);
  if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select({ sourceId: dataSource.sourceId, name: dataSource.name, sourceType: dataSource.sourceType, connectionMethod: dataSource.connectionMethod, channel: dataSource.channel, status: dataSource.status, lastSyncAt: dataSource.lastSyncAt, configuration: dataSource.configuration }).from(dataSource).where(eq(dataSource.companyId, companyId)).orderBy(asc(dataSource.createdAt));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', sources: rows });
});

app.get('/api/analytics/overview', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  return c.json(await analyticsOverview(db, companyId));
});

app.post('/api/sources', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const body = jsonObject(await c.req.json());
  if (typeof body.name !== 'string' || typeof body.connectionMethod !== 'string') return c.json({ status: 'INVALID_INPUT', message: 'name and connectionMethod are required' }, 400);
  const authMethod = ['NONE', 'API_KEY', 'BEARER'].includes(String(body.authMethod)) ? String(body.authMethod) : 'NONE'; const credential = typeof body.credential === 'string' && body.credential ? body.credential : null;
  if (authMethod !== 'NONE' && !credential) return c.json({ status: 'INVALID_INPUT', message: 'A credential is required for the selected authentication method.' }, 400);
  const [source] = await db.insert(dataSource).values({ companyId, name: body.name.trim(), sourceType: typeof body.sourceType === 'string' ? body.sourceType : 'EVENT_API', connectionMethod: body.connectionMethod, channel: typeof body.channel === 'string' ? body.channel : null, status: 'CONFIGURING', credentialsReference: credential ? credentialHash(credential) : null, configuration: { ...jsonObject(body.configuration), endpointUrl: typeof body.endpointUrl === 'string' ? body.endpointUrl : '/events', authMethod, credentialConfigured: Boolean(credential) } }).returning({ sourceId: dataSource.sourceId, name: dataSource.name, status: dataSource.status, configuration: dataSource.configuration });
  return c.json({ status: 'AVAILABLE', source }, 201);
});

app.get('/api/sources/:sourceId/mappings', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const [owned] = await db.select({ sourceId: dataSource.sourceId }).from(dataSource).where(and(eq(dataSource.companyId, companyId), eq(dataSource.sourceId, c.req.param('sourceId')))); if (!owned) return c.json({ status: 'NOT_FOUND' }, 404); const mappings = await db.select().from(sourceFieldMapping).where(eq(sourceFieldMapping.sourceId, owned.sourceId)).orderBy(asc(sourceFieldMapping.sourceField)); return c.json({ status: mappings.length ? 'AVAILABLE' : 'EMPTY', mappings }); });
app.put('/api/sources/:sourceId/mappings', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const [owned] = await db.select({ sourceId: dataSource.sourceId }).from(dataSource).where(and(eq(dataSource.companyId, companyId), eq(dataSource.sourceId, c.req.param('sourceId')))); if (!owned) return c.json({ status: 'NOT_FOUND' }, 404); const body = jsonObject(await c.req.json()); if (!Array.isArray(body.mappings)) return c.json({ status: 'INVALID_INPUT' }, 400); const mappings = body.mappings.map(jsonObject); if (mappings.some((row) => typeof row.sourceField !== 'string' || typeof row.semanticField !== 'string')) return c.json({ status: 'INVALID_INPUT' }, 400); const saved = await db.transaction(async (tx) => { await tx.delete(sourceFieldMapping).where(eq(sourceFieldMapping.sourceId, owned.sourceId)); if (!mappings.length) return []; return tx.insert(sourceFieldMapping).values(mappings.map((row) => ({ sourceId: owned.sourceId, sourceField: String(row.sourceField), semanticField: String(row.semanticField), required: row.required === true, conditional: row.conditional === true, validationStatus: 'VALID' }))).returning(); }); return c.json({ status: saved.length ? 'AVAILABLE' : 'EMPTY', mappings: saved }); });
app.post('/api/sources/:sourceId/mappings/suggest', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); if (!gemini) return c.json({ status: 'UNAVAILABLE', message: 'Gemini is not configured.' }, 503); const companyId = tenantId(c); const [owned] = await db.select({ sourceId: dataSource.sourceId }).from(dataSource).where(and(eq(dataSource.companyId, companyId), eq(dataSource.sourceId, c.req.param('sourceId')))); if (!owned) return c.json({ status: 'NOT_FOUND' }, 404); const body = jsonObject(await c.req.json()); const sample = jsonObject(body.sample); if (!Object.keys(sample).length) return c.json({ status: 'INVALID_INPUT' }, 400); try { const response = await gemini.complete(`Map this source payload to Breeze semantic fields. Return JSON only as {"mappings":[{"sourceField":"","semanticField":"","required":false}]}. Allowed semantic fields: source_event_id, customer_reference, account_reference, order_reference, policy_reference, claim_reference, case_reference, transaction_reference, session_reference, event_type, event_time, channel, topic, escalation_indicator, transcript, content, entity_type, entity_id. Payload: ${JSON.stringify(sample)}`); const text = response?.candidates?.[0]?.content?.parts?.map((part: any) => part.text ?? '').join('') ?? ''; const match = text.match(/\{[\s\S]*\}/); const parsed = match ? JSON.parse(match[0]) : null; if (!Array.isArray(parsed?.mappings)) throw new Error('invalid mapping'); return c.json({ status: 'AVAILABLE', mappings: parsed.mappings, persisted: false, message: 'Review and confirm before saving. Gemini will not be called during event ingestion.' }); } catch { return c.json({ status: 'ERROR', message: 'Mapping suggestion failed safely.' }, 502); } });

const DEMO_COMPANY_ID = '10000000-0000-4000-8000-000000000001';
async function demoSource() { return (await db!.select().from(dataSource).where(and(eq(dataSource.companyId, DEMO_COMPANY_ID), eq(dataSource.status, 'ACTIVE'))).orderBy(asc(dataSource.createdAt)))[0]; }
app.post('/api/demo/dropoffs', async (c) => { if (tenantId(c) !== DEMO_COMPANY_ID) return c.json({ status: 'FORBIDDEN' }, 403); const source = await demoSource(); if (!source) return c.json({ status: 'UNAVAILABLE' }, 503); const results = []; for (let index = 1; index <= 10; index++) { const customerId = `80000000-0000-4000-8000-${String(index).padStart(12, '0')}`; const reference = `JF-DROPOFF-${String(index).padStart(2, '0')}`; await db!.insert(customer).values({ customerId, companyId: DEMO_COMPANY_ID, displayName: `JourneyFlow Drop-off ${index}` }).onConflictDoNothing(); await db!.insert(identityMapping).values({ companyId: DEMO_COMPANY_ID, sourceId: source.sourceId, identifierType: 'customer_reference', identifierValue: reference, customerId }).onConflictDoNothing(); results.push(await processExternalEvent(DEMO_COMPANY_ID, source, { sourceId: source.sourceId, scenarioId: `dropoff-${index}`, userId: reference, eventName: 'JOURNEY_START', timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), channel: index % 2 ? 'web' : 'mobile', orderId: `ENTITY-${index}`, entityType: 'case' })); } return c.json({ status: 'AVAILABLE', customers: 10, firstCustomerId: '80000000-0000-4000-8000-000000000001', accepted: results.filter((row) => row.result.status === 'ACCEPTED').length, duplicates: results.filter((row) => row.result.status === 'DUPLICATE').length }); });
app.post('/api/demo/repeat-complaint', async (c) => { if (tenantId(c) !== DEMO_COMPANY_ID) return c.json({ status: 'FORBIDDEN' }, 403); const source = await demoSource(); if (!source) return c.json({ status: 'UNAVAILABLE' }, 503); await db!.insert(identityMapping).values({ companyId: DEMO_COMPANY_ID, sourceId: source.sourceId, identifierType: 'customer_reference', identifierValue: 'U-1001', customerId: '30000000-0000-4000-8000-000000000001' }).onConflictDoNothing(); await processExternalEvent(DEMO_COMPANY_ID, source, { sourceId: source.sourceId, scenarioId: 'repeat-complaint-web', userId: 'U-1001', eventName: 'support_complaint', timestamp: new Date(Date.now() - 60000).toISOString(), channel: 'web', message: 'My payment failed', orderId: 'ORD-1001', entityType: 'order', topic: 'payment failure' }); const second = await processExternalEvent(DEMO_COMPANY_ID, source, { sourceId: source.sourceId, scenarioId: 'repeat-complaint-mobile', userId: 'U-1001', eventName: 'support_complaint', timestamp: new Date().toISOString(), channel: 'mobile', message: 'My payment is still failing', orderId: 'ORD-1001', entityType: 'order', topic: 'payment failure' }); return c.json({ status: 'AVAILABLE', customerId: '30000000-0000-4000-8000-000000000001', issueId: (second.result as any).issue?.issueId ?? null, notification: { type: 'REPEAT_CONTACT', message: 'Repeat contact detected' } }); });
app.post('/api/demo/cross-channel', async (c) => { if (tenantId(c) !== DEMO_COMPANY_ID) return c.json({ status: 'FORBIDDEN' }, 403); const source = await demoSource(); if (!source) return c.json({ status: 'UNAVAILABLE' }, 503); const customerId = '80000000-0000-4000-8000-000000000099', reference = 'JF-CROSS-CHANNEL'; await db!.insert(customer).values({ customerId, companyId: DEMO_COMPANY_ID, displayName: 'JourneyFlow Cross-channel' }).onConflictDoNothing(); await db!.insert(identityMapping).values({ companyId: DEMO_COMPANY_ID, sourceId: source.sourceId, identifierType: 'customer_reference', identifierValue: reference, customerId }).onConflictDoNothing(); const stamp = Date.now(); for (const [index, payload] of [{ eventName: 'JOURNEY_START', channel: 'web' }, { eventName: 'CONTACT', channel: 'mobile' }, { eventName: 'JOURNEY_COMPLETE', channel: 'call_center' }].entries()) await processExternalEvent(DEMO_COMPANY_ID, source, { sourceId: source.sourceId, scenarioId: `cross-channel-${index}`, userId: reference, timestamp: new Date(stamp + index * 1000).toISOString(), orderId: 'CROSS-1', entityType: 'case', ...payload }); return c.json({ status: 'AVAILABLE', customerId, channels: ['web', 'mobile', 'call_center'] }); });

app.post('/api/events', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rawBody = jsonObject(await c.req.json());
  if (typeof rawBody.sourceId !== 'string') return c.json({ status: 'INVALID_INPUT', message: 'sourceId is required' }, 400);
  let body = rawBody;
  const [source] = await db.select({ sourceId: dataSource.sourceId }).from(dataSource).where(and(eq(dataSource.sourceId, rawBody.sourceId), eq(dataSource.companyId, companyId), eq(dataSource.status, 'ACTIVE')));
  if (!source) return c.json({ status: 'NOT_FOUND', message: 'Active source not found' }, 404);
  const configuredMappings = await db.select({ sourceField: sourceFieldMapping.sourceField, semanticField: sourceFieldMapping.semanticField, required: sourceFieldMapping.required }).from(sourceFieldMapping).where(eq(sourceFieldMapping.sourceId, source.sourceId));
  const mapped = normalizeSourcePayload(rawBody, configuredMappings); if (mapped.missing.length) return c.json({ status: 'INVALID_INPUT', message: 'Required mapped fields are missing.', fields: mapped.missing }, 400); body = mapped.normalized;
  if (typeof body.eventType !== 'string') return c.json({ status: 'INVALID_INPUT', message: 'eventType is required after source mapping' }, 400);
  const sourceEventId = typeof body.sourceEventId === 'string' ? body.sourceEventId : null;
  if (sourceEventId) {
    const [duplicate] = await db.select({ eventId: event.eventId }).from(event).where(and(eq(event.companyId, companyId), eq(event.sourceId, source.sourceId), eq(event.sourceEventId, sourceEventId)));
    if (duplicate) return c.json({ status: 'DUPLICATE', eventId: duplicate.eventId }, 200);
  }
  const attributes = jsonObject(body.attributes);
  const identifiers = jsonObject(body.identifiers);
  const customerId = typeof body.customerId === 'string' ? body.customerId : null;
  const [stored] = await db.insert(event).values({ companyId, sourceId: source.sourceId, sourceEventId, customerId, eventTime: body.eventTime ? new Date(String(body.eventTime)) : new Date(), channel: typeof body.channel === 'string' ? body.channel : null, eventType: body.eventType, businessEntityType: typeof body.entityType === 'string' ? body.entityType : null, businessEntityId: typeof body.entityId === 'string' ? body.entityId : null, sessionId: typeof body.sessionId === 'string' ? body.sessionId : null, attributes: { ...attributes, identifiers }, rawPayload: body, processedAt: new Date() }).returning({ eventId: event.eventId, eventTime: event.eventTime });
  const identity = await resolveEventIdentity(db, { companyId, eventId: stored.eventId, canonicalCustomerId: customerId, identifiers });
  const resolution = identity.status;
  const effectiveCustomerId = identity.customerId;
  const topic = typeof body.topic === 'string' ? body.topic.trim().toLowerCase() : null;
  if (effectiveCustomerId && topic && (body.eventType === 'COMPLAINT' || body.eventType === 'SUPPORT_COMPLAINT')) {
    await groupComplaintIntoIssue(db, { companyId, customerId: effectiveCustomerId, eventId: stored.eventId, topic: normalizeComplaintTopic(topic) ?? topic, occurredAt: stored.eventTime ?? new Date(), channel: typeof body.channel === 'string' ? body.channel : null, entityId: typeof body.entityId === 'string' ? body.entityId : null });
  }
  if (effectiveCustomerId) await persistEscalation(db, { companyId, customerId: effectiveCustomerId, eventId: stored.eventId, occurredAt: stored.eventTime ?? new Date(), payload: body });
  const journey = await evaluateJourneyEvent(db, { companyId, eventId: stored.eventId, customerId: effectiveCustomerId, eventType: body.eventType, eventTime: stored.eventTime ?? new Date(), entityType: typeof body.entityType === 'string' ? body.entityType : null, entityId: typeof body.entityId === 'string' ? body.entityId : null });
  return c.json({ status: 'ACCEPTED', event: stored, identity: resolution, journey }, 202);
});

app.get('/api/customers/:customerId/timeline', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const [profile] = await db.select({ customerId: customer.customerId, displayName: customer.displayName, createdAt: customer.createdAt }).from(customer).where(and(eq(customer.companyId, companyId), eq(customer.customerId, c.req.param('customerId'))));
  if (!profile) return c.json({ status: 'NOT_FOUND' }, 404);
  const events = await db.select({ eventId: event.eventId, eventTime: event.eventTime, eventType: event.eventType, channel: event.channel, sourceId: event.sourceId, entityType: event.businessEntityType, entityId: event.businessEntityId, attributes: event.attributes }).from(event).where(and(eq(event.companyId, companyId), eq(event.customerId, profile.customerId))).orderBy(asc(event.eventTime), asc(event.eventId));
  return c.json({ status: events.length ? 'AVAILABLE' : 'EMPTY', customer: profile, timeline: events });
});
app.get('/api/customers/:customerId', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const customerId = c.req.param('customerId');
  const [profile] = await db.select().from(customer).where(and(eq(customer.companyId, companyId), eq(customer.customerId, customerId))); if (!profile) return c.json({ status: 'NOT_FOUND' }, 404);
  const [timeline, sourceIdentifiers, issues, complaints, escalations, journeys, journeyStages, churn] = await Promise.all([
    db.select().from(event).where(and(eq(event.companyId, companyId), eq(event.customerId, customerId))).orderBy(asc(event.eventTime), asc(event.eventId)),
    db.select({ identifierType: identityMapping.identifierType, identifierValue: identityMapping.identifierValue, sourceId: identityMapping.sourceId, confidence: identityMapping.confidence }).from(identityMapping).where(and(eq(identityMapping.companyId, companyId), eq(identityMapping.customerId, customerId))),
    customerIssues(db, companyId, customerId),
    db.select().from(complaint).where(and(eq(complaint.companyId, companyId), eq(complaint.customerId, customerId))).orderBy(asc(complaint.occurredAt)),
    customerEscalations(db, companyId, customerId), customerJourneys(db, companyId, customerId),
    db.select({ instanceId: journeyInstanceStage.instanceId, stageId: journeyInstanceStage.stageId, status: journeyInstanceStage.status, reachedAt: journeyInstanceStage.reachedAt, completedAt: journeyInstanceStage.completedAt, stageKey: journeyStageDefinition.stageKey, stageName: journeyStageDefinition.name, ordinal: journeyStageDefinition.ordinal }).from(journeyInstanceStage).innerJoin(journeyInstance, eq(journeyInstanceStage.instanceId, journeyInstance.instanceId)).innerJoin(journeyStageDefinition, eq(journeyInstanceStage.stageId, journeyStageDefinition.stageId)).where(and(eq(journeyInstance.companyId, companyId), eq(journeyInstance.customerId, customerId))).orderBy(asc(journeyStageDefinition.ordinal)),
    db.select().from(churnOutcome).where(and(eq(churnOutcome.companyId, companyId), eq(churnOutcome.customerId, customerId))).orderBy(asc(churnOutcome.churnTimestamp))
  ]);
  const proactiveSignals = [...issues.filter((row: any) => ['OPEN', 'IN_PROGRESS', 'ESCALATED', 'REOPENED'].includes(row.status)).map((row: any) => ({ type: 'UNRESOLVED_ISSUE', referenceId: row.issueId })), ...journeys.filter((row: any) => row.status === 'DROPPED_OFF').map((row: any) => ({ type: 'JOURNEY_DROPOFF', referenceId: row.instanceId })), ...escalations.map((row: any) => ({ type: 'ESCALATION', referenceId: row.escalationId }))];
  return c.json({ status: 'AVAILABLE', customer: profile, sourceIdentifiers, timeline, issues, complaints, escalations, journeys, journeyStages, churn, repeatContacts: Math.max(0, timeline.length - 1), proactiveSignals, provenance: { companyId, tables: ['customer', 'identity_mapping', 'event', 'complaint', 'issue', 'escalation', 'journey_instance', 'journey_instance_stage', 'churn_outcome'] } });
});

app.post('/api/config/journeys', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const body = jsonObject(await c.req.json());
  const name = typeof body.name === 'string' ? body.name : null;
  const stages = Array.isArray(body.stages) ? body.stages : null;
  if (!name || !stages) return c.json({ status: 'INVALID_INPUT' }, 400);
  const result = await db.transaction(async (tx) => {
    const [journey] = await tx.insert(journeyDefinition).values({ companyId, name: name.trim(), status: 'ACTIVE', configuration: jsonObject(body.configuration) }).returning();
    for (const [index, raw] of stages.entries()) {
      const stage = jsonObject(raw);
      const [saved] = await tx.insert(journeyStageDefinition).values({ journeyId: journey.journeyId, stageKey: String(stage.key ?? `stage-${index + 1}`), name: String(stage.name ?? stage.key ?? `Stage ${index + 1}`), ordinal: index, required: stage.required !== false, timeoutSeconds: typeof stage.timeoutSeconds === 'number' ? stage.timeoutSeconds : null }).returning();
      const events = Array.isArray(stage.eventTypes) ? stage.eventTypes : [];
      for (const eventType of events) await tx.insert(journeyEventMapping).values({ stageId: saved.stageId, eventType: String(eventType), conditions: {} });
    }
    return journey;
  });
  return c.json({ status: 'AVAILABLE', journey: result }, 201);
});

app.get('/api/config/journeys', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select().from(journeyDefinition).where(eq(journeyDefinition.companyId, companyId)).orderBy(asc(journeyDefinition.createdAt));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', journeys: rows });
});

app.post('/api/config/issue-rules', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const body = jsonObject(await c.req.json());
  if (typeof body.name !== 'string') return c.json({ status: 'INVALID_INPUT' }, 400);
  const [rule] = await db.insert(issueGroupingRule).values({ companyId, name: body.name.trim(), configuration: jsonObject(body.configuration), active: body.active !== false }).returning();
  return c.json({ status: 'AVAILABLE', rule }, 201);
});

app.post('/api/customers/:customerId/churn', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const body = jsonObject(await c.req.json());
  if (typeof body.churnType !== 'string' || typeof body.source !== 'string' || !body.churnTimestamp) return c.json({ status: 'INVALID_INPUT' }, 400);
  const [existingCustomer] = await db.select({ customerId: customer.customerId }).from(customer).where(and(eq(customer.companyId, companyId), eq(customer.customerId, c.req.param('customerId'))));
  if (!existingCustomer) return c.json({ status: 'NOT_FOUND' }, 404);
  const [outcome] = await db.insert(churnOutcome).values({ companyId, customerId: existingCustomer.customerId, churnType: body.churnType, churnTimestamp: new Date(String(body.churnTimestamp)), source: body.source, sourceReference: typeof body.sourceReference === 'string' ? body.sourceReference : null, recordedReason: typeof body.recordedReason === 'string' ? body.recordedReason : null }).onConflictDoNothing().returning();
  return c.json({ status: outcome ? 'AVAILABLE' : 'DUPLICATE', churn: outcome ?? null }, outcome ? 201 : 200);
});

app.get('/api/customers/:customerId/issues', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select().from(issue).where(and(eq(issue.companyId, companyId), eq(issue.customerId, c.req.param('customerId')))).orderBy(asc(issue.createdAt));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', issues: rows });
});

app.patch('/api/issues/:issueId', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const body = jsonObject(await c.req.json());
  try { const row = await updateIssueStatus(db, companyId, c.req.param('issueId'), typeof body.status === 'string' ? body.status : 'OPEN', typeof body.resolutionNote === 'string' ? body.resolutionNote : undefined); return c.json({ status: 'AVAILABLE', issue: row }); } catch (error: any) { return c.json({ status: error.code ?? 'ERROR' }, error.code === 'NOT_FOUND' ? 404 : 400); }
});

app.get('/api/customers/:customerId/escalations', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select().from(escalation).where(and(eq(escalation.companyId, companyId), eq(escalation.customerId, c.req.param('customerId')))).orderBy(asc(escalation.occurredAt));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', escalations: rows });
});

app.get('/api/customers/:customerId/journeys', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select({ instance: journeyInstance, journeyName: journeyDefinition.name }).from(journeyInstance).innerJoin(journeyDefinition, eq(journeyInstance.journeyId, journeyDefinition.journeyId)).where(and(eq(journeyInstance.companyId, companyId), eq(journeyInstance.customerId, c.req.param('customerId')))).orderBy(asc(journeyInstance.startedAt));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', journeys: rows });
});

const MCP_TOOLS = new Set<string>(MCP_TOOL_NAMES);

app.post('/api/mcp/:tool', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE', code: 'DATABASE_UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const result = await invokeMcpTool(db, companyId, c.req.param('tool'), await c.req.json().catch(() => ({})));
  return c.json(result.body as any, result.httpStatus as any);
});

app.post('/api/chat', async (c) => {
  if (!gemini) return c.json({ status: 'UNAVAILABLE', message: 'Gemini is not configured.' }, 503);
  const body = jsonObject(await c.req.json()); const message = typeof body.message === 'string' ? body.message.trim() : ''; if (!message) return c.json({ status: 'INVALID_INPUT' }, 400);
  const customerId = typeof body.customerId === 'string' ? body.customerId : null;
  if (customerId) { const [owned] = await db!.select({ customerId: customer.customerId }).from(customer).where(and(eq(customer.companyId, tenantId(c)), eq(customer.customerId, customerId))); if (!owned) return c.json({ status: 'NOT_FOUND', message: 'Customer not found.' }, 404); }
  try {
    const context = customerId ? `This question is scoped to customerId ${customerId}. Customer tools must include that exact customerId in arguments.` : 'This is a company-level analytics question.';
    const selection = await gemini.complete(`Select one approved Breeze tool and return JSON only: {"name":"tool","arguments":{}}. Approved tools: ${[...MCP_TOOLS].join(', ')}. ${context} Never invent a tool or companyId. User: ${message}`);
    const selectionText = selection?.candidates?.[0]?.content?.parts?.map((part: any) => part.text ?? '').join('') ?? ''; const match = selectionText.match(/\{[\s\S]*\}/); if (!match) return c.json({ status: 'ERROR', message: 'Gemini returned no valid tool call.' }, 502);
    const call = validateToolCall(JSON.parse(match[0]));
    if (customerId && call.name.startsWith('get_customer_')) call.arguments = { ...call.arguments, customerId };
    const toolResponse = await app.request(`/api/mcp/${call.name}`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: c.req.header('cookie') ?? '' }, body: JSON.stringify(call.arguments) }); const result = await toolResponse.json();
    if (!toolResponse.ok) return c.json({ status: 'ERROR', code: 'MCP_TOOL_FAILED', tool: call.name, result }, toolResponse.status as any);
    const final = await gemini.complete(`Answer using only this deterministic Breeze result. Preserve unavailable/insufficient/association language. User: ${message}\nResult: ${JSON.stringify(result)}`); const answer = final?.candidates?.[0]?.content?.parts?.map((part: any) => part.text ?? '').join('').trim();
    return c.json({ status: answer ? 'AVAILABLE' : 'ERROR', answer: answer || null, tool: call.name, result });
  } catch (error: any) { return c.json({ status: error.code === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'ERROR', code: error.code ?? 'CHAT_ORCHESTRATION_FAILED', message: error.code === 'UNAVAILABLE' ? 'Gemini is temporarily unavailable.' : 'Unable to process the question safely.' }, error.code === 'UNAVAILABLE' ? 503 : 502); }
});

app.get('/api/analytics/:analysis', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503);
  const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const overview = await analyticsOverview(db, companyId);
  const allowed = new Set(['journey', 'dropoffs', 'repeat_contacts', 'unresolved_issues', 'escalations', 'churn_associations', 'identity_resolution', 'data_quality', 'latency']);
  if (!allowed.has(c.req.param('analysis'))) return c.json({ status: 'NOT_FOUND' }, 404);
  if (c.req.param('analysis') === 'churn_associations') { const end = new Date(); const start = new Date(end.getTime() - 30 * 86400000); return c.json({ analysis: 'churn_associations', ...(await analyzeChurn(db, companyId, start, end)), provenance: { companyId } }); }
  return c.json({ ...overview, analysis: c.req.param('analysis'), limitations: [] });
});

app.get('/api/reports', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401);
  const rows = await db.select().from((await import('../db/schema.js')).reportDefinition).where(eq((await import('../db/schema.js')).reportDefinition.companyId, companyId));
  return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', reports: rows });
});
app.post('/api/reports', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const body = jsonObject(await c.req.json());
  if (typeof body.name !== 'string' || typeof body.reportType !== 'string' || !REPORT_TYPES.includes(body.reportType as ReportType)) return c.json({ status: 'INVALID_INPUT' }, 400);
  const { reportDefinition } = await import('../db/schema.js'); const [report] = await db.insert(reportDefinition).values({ companyId, name: body.name.trim(), reportType: body.reportType, description: typeof body.description === 'string' ? body.description : null, configuration: jsonObject(body.configuration), isDefault: false }).returning();
  return c.json({ status: 'AVAILABLE', report }, 201);
});
app.get('/api/reports/definitions/:reportId', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const { reportDefinition } = await import('../db/schema.js'); const [row] = await db.select().from(reportDefinition).where(and(eq(reportDefinition.companyId, companyId), eq(reportDefinition.reportId, c.req.param('reportId')))); return row ? c.json({ status: 'AVAILABLE', report: row }) : c.json({ status: 'NOT_FOUND' }, 404); });
app.patch('/api/reports/:reportId', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const body = jsonObject(await c.req.json()); const { reportDefinition } = await import('../db/schema.js'); const changes: any = { updatedAt: new Date() }; if (typeof body.name === 'string') changes.name = body.name.trim(); if (typeof body.description === 'string') changes.description = body.description; if (body.configuration && typeof body.configuration === 'object') changes.configuration = jsonObject(body.configuration); const [row] = await db.update(reportDefinition).set(changes).where(and(eq(reportDefinition.companyId, companyId), eq(reportDefinition.reportId, c.req.param('reportId')))).returning(); return row ? c.json({ status: 'AVAILABLE', report: row }) : c.json({ status: 'NOT_FOUND' }, 404); });
app.delete('/api/reports/:reportId', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const { reportDefinition } = await import('../db/schema.js'); const [row] = await db.delete(reportDefinition).where(and(eq(reportDefinition.companyId, companyId), eq(reportDefinition.reportId, c.req.param('reportId')))).returning({ reportId: reportDefinition.reportId }); return row ? c.body(null, 204) : c.json({ status: 'NOT_FOUND' }, 404); });
app.post('/api/reports/run', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const body = jsonObject(await c.req.json()); if (typeof body.reportType !== 'string' || !REPORT_TYPES.includes(body.reportType as ReportType)) return c.json({ status: 'INVALID_INPUT' }, 400); const { reportRun } = await import('../db/schema.js'); const parameters = jsonObject(body.parameters); const [run] = await db.insert(reportRun).values({ reportId: null, status: 'RUNNING', parameters: { ...parameters, companyId, reportType: body.reportType } }).returning(); try { const reportResult = await executeReportAnalysis(db, companyId, body.reportType as ReportType, parameters); const [completed] = await db.update(reportRun).set({ status: 'COMPLETED', completedAt: new Date(), resultSnapshot: { ...reportResult, runId: run.runId, parameters, companyId } }).where(eq(reportRun.runId, run.runId)).returning(); return c.json({ status: 'COMPLETED', run: completed }, 201); } catch { await db.update(reportRun).set({ status: 'FAILED', completedAt: new Date(), resultSnapshot: { status: 'ERROR', error: 'REPORT_EXECUTION_FAILED' } }).where(eq(reportRun.runId, run.runId)); return c.json({ status: 'ERROR' }, 500); } });
app.post('/api/reports/:reportId/run', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const { reportDefinition, reportRun } = await import('../db/schema.js');
  const [definition] = await db.select().from(reportDefinition).where(and(eq(reportDefinition.companyId, companyId), eq(reportDefinition.reportId, c.req.param('reportId')))); if (!definition) return c.json({ status: 'NOT_FOUND' }, 404);
  const requestedParameters = jsonObject((await c.req.json().catch(() => ({}))) as unknown);
  const [run] = await db.insert(reportRun).values({ reportId: definition.reportId, status: 'RUNNING', parameters: { ...requestedParameters, companyId } }).returning();
  try { const reportResult = await executeReportAnalysis(db, companyId, definition.reportType as ReportType, requestedParameters); const snapshot = { ...reportResult, runId: run.runId, parameters: requestedParameters, companyId }; const [completed] = await db.update(reportRun).set({ status: 'COMPLETED', completedAt: new Date(), resultSnapshot: snapshot }).where(eq(reportRun.runId, run.runId)).returning(); return c.json({ status: 'COMPLETED', run: completed }, 201); } catch { await db.update(reportRun).set({ status: 'FAILED', completedAt: new Date(), resultSnapshot: { status: 'ERROR', error: 'REPORT_EXECUTION_FAILED' } }).where(eq(reportRun.runId, run.runId)); return c.json({ status: 'ERROR' }, 500); }
});
app.post('/api/reports/:reportId/execute', async (c) => app.request(`/api/reports/${c.req.param('reportId')}/run`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: c.req.header('cookie') ?? '' }, body: await c.req.text() }));
app.get('/api/reports/runs', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const { reportRun } = await import('../db/schema.js'); const rows = await db.select().from(reportRun).where(drizzleSql`${reportRun.parameters}->>'companyId' = ${companyId}`).orderBy(asc(reportRun.createdAt)); return c.json({ status: rows.length ? 'AVAILABLE' : 'EMPTY', runs: rows }); });

app.post('/api/reports/runs/:runId/artifacts', async (c) => {
  if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); if (!companyId) return c.json({ status: 'UNAUTHORIZED' }, 401); const body = jsonObject(await c.req.json()); const format = String(body.format ?? '').toLowerCase() as ArtifactFormat; if (!['json', 'csv', 'pdf', 'docx'].includes(format)) return c.json({ status: 'INVALID_INPUT' }, 400);
  const { reportDefinition, reportRun } = await import('../db/schema.js'); const [row] = await db.select({ run: reportRun, reportType: reportDefinition.reportType, companyName: company.name }).from(reportRun).innerJoin(reportDefinition, eq(reportRun.reportId, reportDefinition.reportId)).innerJoin(company, eq(reportDefinition.companyId, company.companyId)).where(and(eq(reportRun.runId, c.req.param('runId')), eq(reportDefinition.companyId, companyId)));
  if (!row || row.run.status !== 'COMPLETED' || !row.run.resultSnapshot) return c.json({ status: 'NOT_FOUND' }, 404);
  try { const createdAt = new Date(); const filename = artifactFilename(row.companyName, row.reportType, row.run.runId, createdAt, format); const directory = path.resolve(process.cwd(), 'artifacts'); await mkdir(directory, { recursive: true }); const bytes = await renderArtifact(format, row.run.resultSnapshot); const artifactPath = path.join(directory, filename); await writeFile(artifactPath, bytes); const reference = { filename, contentType: format === 'json' ? 'application/json' : format === 'csv' ? 'text/csv; charset=utf-8' : format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + 30 * 86400000).toISOString(), size: bytes.length, path: artifactPath }; await db.update(reportRun).set({ artifactReference: reference }).where(eq(reportRun.runId, row.run.runId)); return c.json({ status: 'AVAILABLE', artifact: { ...reference, path: undefined } }, 201); } catch { return c.json({ status: 'ERROR', message: 'Artifact generation failed without affecting the report result.' }, 500); }
});
app.get('/api/reports/runs/:runId/artifact', async (c) => { if (!db) return c.json({ status: 'UNAVAILABLE' }, 503); const companyId = tenantId(c); const { reportDefinition, reportRun } = await import('../db/schema.js'); const [row] = await db.select({ artifact: reportRun.artifactReference }).from(reportRun).leftJoin(reportDefinition, eq(reportRun.reportId, reportDefinition.reportId)).where(and(eq(reportRun.runId, c.req.param('runId')), or(eq(reportDefinition.companyId as any, companyId), drizzleSql`${reportRun.parameters}->>'companyId' = ${companyId}`))); const artifact: any = row?.artifact; if (!artifact?.path || new Date(artifact.expiresAt).getTime() <= Date.now()) return c.json({ status: 'UNAVAILABLE', message: 'Artifact is unavailable or expired.' }, 404); try { const bytes = await readFile(artifact.path); return new Response(bytes, { headers: { 'content-type': artifact.contentType, 'content-disposition': `attachment; filename="${artifact.filename}"` } }); } catch { return c.json({ status: 'UNAVAILABLE' }, 404); } });

export { app, MCP_TOOLS };
export default { port: Number(process.env.PORT ?? 3001), fetch: app.fetch };

import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import { company, customer, dataSource, sourceFieldMapping, event, identityMapping, issue, journeyDefinition, journeyEventMapping, journeyInstance, journeyStageDefinition, reportDefinition, churnOutcome } from '../db/schema.js';
import { REPORT_TYPES } from './reports.js';
import { resolveEventIdentity } from './identity.js';
import { evaluateJourneyEvent, recomputeJourney } from './journeys.js';
import { groupComplaintIntoIssue, updateIssueStatus } from './issues.js';
import { persistEscalation } from './escalations.js';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('DATABASE_URL is required to seed Breeze.');
const sql = postgres(url); const db = drizzle(sql);
const ids = { company: '10000000-0000-4000-8000-000000000001', web: '20000000-0000-4000-8000-000000000001', support: '20000000-0000-4000-8000-000000000002', a: '30000000-0000-4000-8000-000000000001', b: '30000000-0000-4000-8000-000000000002', c: '30000000-0000-4000-8000-000000000003', journey: '40000000-0000-4000-8000-000000000001', start: '41000000-0000-4000-8000-000000000001', finish: '41000000-0000-4000-8000-000000000002' };

await db.insert(company).values({ companyId: ids.company, name: 'Breeze Demo', timezone: 'UTC', industry: 'Cross-industry customer experience' }).onConflictDoNothing();
await db.insert(dataSource).values([{ sourceId: ids.web, companyId: ids.company, name: 'Digital interactions', sourceType: 'EVENT_API', connectionMethod: 'REST_API', channel: 'WEB', status: 'ACTIVE' }, { sourceId: ids.support, companyId: ids.company, name: 'Support interactions', sourceType: 'EVENT_API', connectionMethod: 'WEBHOOK', channel: 'CALL_CENTER', status: 'ACTIVE' }]).onConflictDoNothing();
await db.update(dataSource).set({ status: 'ACTIVE', configuration: { endpointUrl: '/events', authMethod: 'NONE', credentialConfigured: false } }).where(eq(dataSource.sourceId, ids.web));
await db.insert(sourceFieldMapping).values([{ sourceId: ids.web, sourceField: 'scenarioId', semanticField: 'source_event_id', required: true, validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'userId', semanticField: 'customer_reference', required: true, validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'eventName', semanticField: 'event_type', required: true, validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'timestamp', semanticField: 'event_time', required: true, validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'channel', semanticField: 'channel', validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'message', semanticField: 'content', validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'orderId', semanticField: 'entity_id', validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'entityType', semanticField: 'entity_type', validationStatus: 'VALID' }, { sourceId: ids.web, sourceField: 'topic', semanticField: 'topic', validationStatus: 'VALID' }]).onConflictDoNothing();
await db.insert(customer).values([{ customerId: ids.a, companyId: ids.company, displayName: 'Demo Customer A' }, { customerId: ids.b, companyId: ids.company, displayName: 'Demo Customer B' }, { customerId: ids.c, companyId: ids.company, displayName: 'Demo Customer C' }]).onConflictDoNothing();
await db.insert(identityMapping).values([{ companyId: ids.company, sourceId: ids.web, identifierType: 'email', identifierValue: 'customer-a@example.test', customerId: ids.a }, { companyId: ids.company, sourceId: ids.support, identifierType: 'account_reference', identifierValue: 'B-200', customerId: ids.b }, { companyId: ids.company, sourceId: ids.web, identifierType: 'email', identifierValue: 'customer-c@example.test', customerId: ids.c }]).onConflictDoNothing();
await db.insert(journeyDefinition).values({ journeyId: ids.journey, companyId: ids.company, name: 'Configured service journey', status: 'ACTIVE', configuration: { startEventType: 'JOURNEY_START', completionEventType: 'JOURNEY_COMPLETE', abandonmentEventType: 'JOURNEY_ABANDONED' } }).onConflictDoNothing();
await db.insert(journeyStageDefinition).values([{ stageId: ids.start, journeyId: ids.journey, stageKey: 'start', name: 'Started', ordinal: 0, required: true, timeoutSeconds: 3600 }, { stageId: ids.finish, journeyId: ids.journey, stageKey: 'finish', name: 'Completed', ordinal: 1, required: true }]).onConflictDoNothing();
await db.insert(journeyEventMapping).values([{ stageId: ids.start, eventType: 'JOURNEY_START' }, { stageId: ids.finish, eventType: 'JOURNEY_COMPLETE' }]).onConflictDoNothing();

type DemoEvent = { id: string; sourceId: string; sourceEventId: string; eventType: string; at: string; customerId?: string | null; identifiers?: Record<string, string>; entityId?: string; channel?: string; payload?: Record<string, unknown> };
async function ingest(input: DemoEvent) {
  const [existing] = await db.select().from(event).where(and(eq(event.companyId, ids.company), eq(event.eventId, input.id)));
  if (existing) return { row: existing, inserted: false, identity: null };
  const [inserted] = await db.insert(event).values({ eventId: input.id, companyId: ids.company, sourceId: input.sourceId, sourceEventId: input.sourceEventId, customerId: input.customerId ?? null, eventTime: new Date(input.at), channel: input.channel ?? 'WEB', eventType: input.eventType, businessEntityType: input.entityId ? 'case' : null, businessEntityId: input.entityId ?? null, attributes: { identifiers: input.identifiers ?? {}, ...(input.payload ?? {}) }, rawPayload: input, processedAt: new Date(input.at) }).onConflictDoNothing().returning();
  if (!inserted) { const [row] = await db.select().from(event).where(eq(event.eventId, input.id)); return { row, inserted: false, identity: null }; }
  const row = inserted;
  const identity = await resolveEventIdentity(db, { companyId: ids.company, eventId: row.eventId, canonicalCustomerId: input.customerId, identifiers: input.identifiers });
  await evaluateJourneyEvent(db, { companyId: ids.company, eventId: row.eventId, customerId: identity.customerId, eventType: input.eventType, eventTime: new Date(input.at), entityType: input.entityId ? 'case' : null, entityId: input.entityId ?? null });
  return { row, identity, inserted: true };
}

await ingest({ id: '60000000-0000-4000-8000-000000000101', sourceId: ids.web, sourceEventId: 'identity-resolved', eventType: 'CONTACT', at: '2026-01-01T08:00:00Z', identifiers: { email: 'customer-a@example.test' } });
await ingest({ id: '60000000-0000-4000-8000-000000000102', sourceId: ids.web, sourceEventId: 'identity-ambiguous', eventType: 'CONTACT', at: '2026-01-01T08:05:00Z', identifiers: { email: 'customer-a@example.test', account_reference: 'B-200' } });
await ingest({ id: '60000000-0000-4000-8000-000000000103', sourceId: ids.web, sourceEventId: 'identity-unresolved', eventType: 'CONTACT', at: '2026-01-01T08:10:00Z', identifiers: { email: 'unknown@example.test' } });

await ingest({ id: '60000000-0000-4000-8000-000000000110', sourceId: ids.web, sourceEventId: 'journey-completed-start', eventType: 'JOURNEY_START', at: '2026-01-02T09:00:00Z', customerId: ids.a, entityId: 'completed-1' });
await ingest({ id: '60000000-0000-4000-8000-000000000111', sourceId: ids.web, sourceEventId: 'journey-completed-finish', eventType: 'JOURNEY_COMPLETE', at: '2026-01-02T09:30:00Z', customerId: ids.a, entityId: 'completed-1' });
await ingest({ id: '60000000-0000-4000-8000-000000000112', sourceId: ids.web, sourceEventId: 'journey-abandoned-start', eventType: 'JOURNEY_START', at: '2026-01-03T09:00:00Z', customerId: ids.b, entityId: 'abandoned-1' });
await ingest({ id: '60000000-0000-4000-8000-000000000113', sourceId: ids.web, sourceEventId: 'journey-abandoned-event', eventType: 'JOURNEY_ABANDONED', at: '2026-01-03T09:20:00Z', customerId: ids.b, entityId: 'abandoned-1' });

const lateStart = await ingest({ id: '60000000-0000-4000-8000-000000000114', sourceId: ids.web, sourceEventId: 'journey-late-start', eventType: 'JOURNEY_START', at: '2026-01-04T09:00:00Z', customerId: ids.c, entityId: 'late-1' });
if (lateStart.inserted) { const [instance] = await db.select().from(journeyInstance).where(and(eq(journeyInstance.companyId, ids.company), eq(journeyInstance.customerId, ids.c), eq(journeyInstance.entityId, 'late-1'))); if (instance) await recomputeJourney(db, ids.company, instance.instanceId, new Date('2026-01-04T11:00:00Z')); }
await ingest({ id: '60000000-0000-4000-8000-000000000115', sourceId: ids.web, sourceEventId: 'journey-late-finish', eventType: 'JOURNEY_COMPLETE', at: '2026-01-04T09:30:00Z', customerId: ids.c, entityId: 'late-1' });

const complaintOne = await ingest({ id: '60000000-0000-4000-8000-000000000120', sourceId: ids.support, sourceEventId: 'issue-first', eventType: 'COMPLAINT', at: '2026-01-05T10:00:00Z', customerId: ids.a, channel: 'CALL_CENTER', entityId: 'case-77' });
let [demoIssue] = await db.select().from(issue).where(and(eq(issue.companyId, ids.company), eq(issue.customerId, ids.a), eq(issue.topic, 'delivery delay')));
if (complaintOne.inserted && !demoIssue) demoIssue = (await groupComplaintIntoIssue(db, { companyId: ids.company, customerId: ids.a, eventId: complaintOne.row.eventId, topic: 'delivery delay', occurredAt: new Date('2026-01-05T10:00:00Z'), channel: 'CALL_CENTER', entityId: 'case-77' })).issue;
if (demoIssue && !['RESOLVED', 'REOPENED'].includes(demoIssue.status)) await updateIssueStatus(db, ids.company, demoIssue.issueId, 'RESOLVED', 'Employee confirmed resolution.');
const complaintTwo = await ingest({ id: '60000000-0000-4000-8000-000000000121', sourceId: ids.support, sourceEventId: 'issue-repeat', eventType: 'COMPLAINT', at: '2026-01-06T10:00:00Z', customerId: ids.a, channel: 'CALL_CENTER', entityId: 'case-77' });
if (complaintTwo.inserted && demoIssue) await groupComplaintIntoIssue(db, { companyId: ids.company, customerId: ids.a, eventId: complaintTwo.row.eventId, topic: 'delivery delay', occurredAt: new Date('2026-01-06T10:00:00Z'), channel: 'CALL_CENTER', entityId: 'case-77' });

const structured = await ingest({ id: '60000000-0000-4000-8000-000000000130', sourceId: ids.support, sourceEventId: 'escalation-structured', eventType: 'SUPPORT_CONTACT', at: '2026-01-06T11:00:00Z', customerId: ids.a, channel: 'CALL_CENTER', payload: { supervisorTransfer: true, reason: 'customer requested supervisor' } });
await persistEscalation(db, { companyId: ids.company, customerId: ids.a, eventId: structured.row.eventId, issueId: demoIssue?.issueId, occurredAt: new Date('2026-01-06T11:00:00Z'), payload: { supervisorTransfer: true, reason: 'customer requested supervisor' } });
const inferred = await ingest({ id: '60000000-0000-4000-8000-000000000131', sourceId: ids.support, sourceEventId: 'escalation-inferred', eventType: 'SUPPORT_CONTACT', at: '2026-01-06T12:00:00Z', customerId: ids.b, channel: 'CALL_CENTER', payload: { transcript: 'Please escalate this complaint to a manager.' } });
await persistEscalation(db, { companyId: ids.company, customerId: ids.b, eventId: inferred.row.eventId, occurredAt: new Date('2026-01-06T12:00:00Z'), payload: { transcript: 'Please escalate this complaint to a manager.' } });

await db.insert(churnOutcome).values({ companyId: ids.company, customerId: ids.a, churnType: 'CONFIGURED_CANCELLATION', churnTimestamp: new Date('2026-01-10T00:00:00Z'), source: 'demo-structured-source', sourceReference: 'cancel-100' }).onConflictDoNothing();
for (const [index, reportType] of REPORT_TYPES.entries()) await db.insert(reportDefinition).values({ reportId: `70000000-0000-4000-8000-${String(index + 1).padStart(12, '0')}`, companyId: ids.company, name: reportType.replaceAll('_', ' '), reportType, configuration: {}, isDefault: true }).onConflictDoNothing();
await sql.end();

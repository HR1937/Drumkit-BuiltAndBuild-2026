import 'dotenv/config';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { churnOutcome, company, customer, dataSource, escalation, event, identityMapping, identityResolution, issue, journeyDefinition, journeyEventMapping, journeyInstance, journeyInstanceStage, journeyStageDefinition } from '../db/schema.js';
import { resolveEventIdentity } from './identity.js';
import { evaluateJourneyEvent, recomputeJourney } from './journeys.js';
import { groupComplaintIntoIssue, updateIssueStatus } from './issues.js';
import { persistEscalation } from './escalations.js';
import { analyzeChurn } from './churn.js';
import { invokeMcpTool, MCP_TOOL_NAMES } from './mcp.js';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
const client = postgres(process.env.DATABASE_URL); const db = drizzle(client);
const companyA = randomUUID(), companyB = randomUUID(), sourceA = randomUUID(), sourceB = randomUUID();
const customerA = randomUUID(), customerRetained = randomUUID(), customerB = randomUUID();
const journeyId = randomUUID(), startStage = randomUUID(), finishStage = randomUUID();
const eventIds: string[] = [];
const assert = (value: unknown, message: string) => { if (!value) throw new Error(message); };

async function addEvent(input: { id?: string; customerId?: string | null; type: string; at: string; entityId?: string; attributes?: Record<string, unknown> }) {
  const id = input.id ?? randomUUID(); eventIds.push(id);
  const [row] = await db.insert(event).values({ eventId: id, companyId: companyA, sourceId: sourceA, sourceEventId: id, customerId: input.customerId ?? null, eventTime: new Date(input.at), processedAt: new Date(input.at), eventType: input.type, channel: 'WEB', businessEntityType: input.entityId ? 'case' : null, businessEntityId: input.entityId ?? null, attributes: input.attributes ?? {}, rawPayload: input }).returning();
  return row;
}

try {
  await db.insert(company).values([{ companyId: companyA, name: 'Domain E2E A' }, { companyId: companyB, name: 'Domain E2E B' }]);
  await db.insert(dataSource).values([{ sourceId: sourceA, companyId: companyA, name: 'E2E source A', sourceType: 'EVENT_API', connectionMethod: 'REST_API', status: 'ACTIVE' }, { sourceId: sourceB, companyId: companyB, name: 'E2E source B', sourceType: 'EVENT_API', connectionMethod: 'REST_API', status: 'ACTIVE' }]);
  await db.insert(customer).values([{ customerId: customerA, companyId: companyA, displayName: 'E2E Churned' }, { customerId: customerRetained, companyId: companyA, displayName: 'E2E Retained' }, { customerId: customerB, companyId: companyB, displayName: 'E2E Other Tenant' }]);
  await db.insert(identityMapping).values([{ companyId: companyA, sourceId: sourceA, identifierType: 'email', identifierValue: 'one@example.test', customerId: customerA }, { companyId: companyA, sourceId: sourceA, identifierType: 'account_reference', identifierValue: 'two', customerId: customerRetained }]);

  const ambiguousEvent = await addEvent({ type: 'CONTACT', at: '2026-01-01T00:00:00Z' });
  const ambiguous = await resolveEventIdentity(db, { companyId: companyA, eventId: ambiguousEvent.eventId, identifiers: { email: 'one@example.test', account_reference: 'two' } });
  assert(ambiguous.status === 'AMBIGUOUS' && ambiguous.candidates.length === 2 && !ambiguous.customerId, 'identity ambiguity was not preserved');
  const unresolvedEvent = await addEvent({ type: 'CONTACT', at: '2026-01-01T00:01:00Z' });
  const unresolved = await resolveEventIdentity(db, { companyId: companyA, eventId: unresolvedEvent.eventId, identifiers: { email: 'missing@example.test' } });
  assert(unresolved.status === 'UNRESOLVED', 'unresolved identity was not preserved');

  await db.insert(journeyDefinition).values({ journeyId, companyId: companyA, name: 'E2E Journey', status: 'ACTIVE', configuration: { startEventType: 'START', completionEventType: 'COMPLETE', abandonmentEventType: 'ABANDON' } });
  await db.insert(journeyStageDefinition).values([{ stageId: startStage, journeyId, stageKey: 'start', name: 'Start', ordinal: 0, required: true, timeoutSeconds: 3600 }, { stageId: finishStage, journeyId, stageKey: 'finish', name: 'Finish', ordinal: 1, required: true }]);
  await db.insert(journeyEventMapping).values([{ stageId: startStage, eventType: 'START' }, { stageId: finishStage, eventType: 'COMPLETE' }]);
  const start = await addEvent({ customerId: customerA, type: 'START', at: '2026-01-02T09:00:00Z', entityId: 'late-case' });
  const started = await evaluateJourneyEvent(db, { companyId: companyA, eventId: start.eventId, customerId: customerA, eventType: 'START', eventTime: new Date('2026-01-02T09:00:00Z'), entityType: 'case', entityId: 'late-case' });
  const instanceId = String(started.instances[0]);
  await recomputeJourney(db, companyA, instanceId, new Date('2026-01-02T11:00:00Z'));
  let [instance] = await db.select().from(journeyInstance).where(eq(journeyInstance.instanceId, instanceId));
  assert(instance.status === 'DROPPED_OFF' && instance.dropoffStageId === startStage, 'valid timeout did not persist drop-off');
  const late = await addEvent({ customerId: customerA, type: 'COMPLETE', at: '2026-01-02T09:30:00Z', entityId: 'late-case' });
  await evaluateJourneyEvent(db, { companyId: companyA, eventId: late.eventId, customerId: customerA, eventType: 'COMPLETE', eventTime: new Date('2026-01-02T09:30:00Z'), entityType: 'case', entityId: 'late-case' });
  [instance] = await db.select().from(journeyInstance).where(eq(journeyInstance.instanceId, instanceId));
  assert(instance.status === 'COMPLETED' && instance.dropoffStageId === null && instance.droppedOffAt === null, 'late progression did not correct drop-off');
  const stages = await db.select().from(journeyInstanceStage).where(eq(journeyInstanceStage.instanceId, instanceId));
  assert(stages.length === 2 && stages.every((row: any) => row.status === 'COMPLETED'), 'late journey stages were not deterministic');

  const completedStart = await addEvent({ customerId: customerRetained, type: 'START', at: '2026-01-03T09:00:00Z', entityId: 'complete-case' });
  await evaluateJourneyEvent(db, { companyId: companyA, eventId: completedStart.eventId, customerId: customerRetained, eventType: 'START', eventTime: new Date('2026-01-03T09:00:00Z'), entityType: 'case', entityId: 'complete-case' });
  const completedEnd = await addEvent({ customerId: customerRetained, type: 'COMPLETE', at: '2026-01-03T09:20:00Z', entityId: 'complete-case' });
  await evaluateJourneyEvent(db, { companyId: companyA, eventId: completedEnd.eventId, customerId: customerRetained, eventType: 'COMPLETE', eventTime: new Date('2026-01-03T09:20:00Z'), entityType: 'case', entityId: 'complete-case' });
  const abandonedStart = await addEvent({ customerId: customerRetained, type: 'START', at: '2026-01-04T09:00:00Z', entityId: 'abandon-case' });
  await evaluateJourneyEvent(db, { companyId: companyA, eventId: abandonedStart.eventId, customerId: customerRetained, eventType: 'START', eventTime: new Date('2026-01-04T09:00:00Z'), entityType: 'case', entityId: 'abandon-case' });
  const abandonedEnd = await addEvent({ customerId: customerRetained, type: 'ABANDON', at: '2026-01-04T09:10:00Z', entityId: 'abandon-case' });
  await evaluateJourneyEvent(db, { companyId: companyA, eventId: abandonedEnd.eventId, customerId: customerRetained, eventType: 'ABANDON', eventTime: new Date('2026-01-04T09:10:00Z'), entityType: 'case', entityId: 'abandon-case' });
  const terminal = await db.select().from(journeyInstance).where(eq(journeyInstance.companyId, companyA));
  assert(terminal.some((row: any) => row.entityId === 'complete-case' && row.status === 'COMPLETED'), 'completed journey missing');
  assert(terminal.some((row: any) => row.entityId === 'abandon-case' && row.status === 'ABANDONED'), 'abandoned journey missing');

  const complaintEvent = await addEvent({ customerId: customerA, type: 'COMPLAINT', at: '2026-01-05T10:00:00Z', entityId: 'issue-case' });
  const grouped = await groupComplaintIntoIssue(db, { companyId: companyA, customerId: customerA, eventId: complaintEvent.eventId, topic: 'service delay', occurredAt: new Date('2026-01-05T10:00:00Z'), channel: 'CALL_CENTER', entityId: 'issue-case' });
  await updateIssueStatus(db, companyA, grouped.issue.issueId, 'RESOLVED', 'Resolved by employee');
  const repeatEvent = await addEvent({ customerId: customerA, type: 'COMPLAINT', at: '2026-01-06T10:00:00Z', entityId: 'issue-case' });
  const reopened = await groupComplaintIntoIssue(db, { companyId: companyA, customerId: customerA, eventId: repeatEvent.eventId, topic: 'service delay', occurredAt: new Date('2026-01-06T10:00:00Z'), channel: 'CALL_CENTER', entityId: 'issue-case' });
  assert(reopened.reopened && reopened.issue.status === 'REOPENED', 'resolved issue was not reopened by qualifying contact');

  const escalationEvent = await addEvent({ customerId: customerA, type: 'SUPPORT', at: '2026-01-06T11:00:00Z' });
  const escalationInput = { companyId: companyA, customerId: customerA, eventId: escalationEvent.eventId, issueId: grouped.issue.issueId, occurredAt: new Date('2026-01-06T11:00:00Z'), payload: { supervisorTransfer: true } };
  const firstEscalation = await persistEscalation(db, escalationInput); const duplicateEscalation = await persistEscalation(db, escalationInput);
  assert(firstEscalation.created && !duplicateEscalation.created && duplicateEscalation.reason === 'DUPLICATE', 'escalation deduplication failed');
  const inferredEvent = await addEvent({ customerId: customerRetained, type: 'SUPPORT', at: '2026-01-06T12:00:00Z' });
  const inferred = await persistEscalation(db, { companyId: companyA, customerId: customerRetained, eventId: inferredEvent.eventId, occurredAt: new Date('2026-01-06T12:00:00Z'), payload: { transcript: 'I need this escalated to a manager.' } });
  assert(inferred.created && inferred.escalation.detectionMethod === 'INFERRED' && Number(inferred.escalation.confidence) > 0, 'inferred escalation missing evidence');
  const escalationRows = await db.select().from(escalation).where(and(eq(escalation.companyId, companyA), eq(escalation.eventId, escalationEvent.eventId)));
  assert(escalationRows.length === 1, 'duplicate escalation row persisted');

  await db.insert(churnOutcome).values({ companyId: companyA, customerId: customerA, churnType: 'CONFIGURED_CANCELLATION', churnTimestamp: new Date('2026-01-10T00:00:00Z'), source: 'structured', sourceReference: randomUUID() });
  const churn = await analyzeChurn(db, companyA, new Date('2026-01-01T00:00:00Z'), new Date('2026-02-01T00:00:00Z'));
  assert(churn.status === 'AVAILABLE' && churn.cohorts.churned.includes(customerA) && churn.cohorts.retained.includes(customerRetained) && (churn.features ?? []).every((row: any) => row.associationOnly), 'churn cohorts or association semantics failed');

  const customerTools = new Set(['get_customer_profile', 'get_customer_timeline', 'get_customer_issues', 'get_customer_journeys', 'get_customer_escalations']);
  const toolResults: Record<string, string> = {};
  for (const tool of MCP_TOOL_NAMES) {
    const input = customerTools.has(tool) ? { customerId: customerA, limit: 50 } : tool === 'analyze_churn_associations' ? { start: '2026-01-01T00:00:00Z', end: '2026-02-01T00:00:00Z' } : {};
    const result = await invokeMcpTool(db, companyA, tool, input); assert(result.httpStatus === 200 && typeof result.body.status === 'string' && result.body.provenance, `MCP tool failed: ${tool}`); toolResults[tool] = result.body.status;
  }
  assert(MCP_TOOL_NAMES.length === 13 && new Set(MCP_TOOL_NAMES).size === 13, 'MCP surface is not exactly 13 tools');
  const invalid = await invokeMcpTool(db, companyA, 'get_customer_profile', {}); assert(invalid.httpStatus === 400, 'MCP invalid input was accepted');
  const crossTenant = await invokeMcpTool(db, companyA, 'get_customer_profile', { customerId: customerB }); assert(crossTenant.httpStatus === 404, 'MCP crossed tenant boundary');
  const ignoredAuthority = await invokeMcpTool(db, companyA, 'get_data_quality', { company_id: companyB }); assert((ignoredAuthority.body.provenance as any).companyId === companyA, 'client company_id overrode MCP tenant');

  console.log(JSON.stringify({ passed: true, identity: { ambiguous: ambiguous.status, unresolved: unresolved.status }, journeys: { lateCorrection: instance.status, completed: true, abandoned: true }, issue: reopened.issue.status, escalation: { deduplicated: true, inferred: inferred.escalation.detectionMethod }, churn: { status: churn.status, churned: churn.cohorts.churned.length, retained: churn.cohorts.retained.length }, mcp: { count: MCP_TOOL_NAMES.length, results: toolResults, invalidInput: invalid.httpStatus, tenantIsolation: crossTenant.httpStatus } }));
} finally {
  await db.delete(company).where(eq(company.companyId, companyA)); await db.delete(company).where(eq(company.companyId, companyB)); await client.end();
}

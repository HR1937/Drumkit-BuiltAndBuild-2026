import { and, asc, eq, lte, gt } from 'drizzle-orm';
import { churnOutcome, customer, event, issue, escalation, journeyInstance } from '../db/schema.js';

export async function churnCohorts(db: any, companyId: string, start: Date, end: Date) {
  const churned = await db.select({ customerId: churnOutcome.customerId, at: churnOutcome.churnTimestamp }).from(churnOutcome).where(and(eq(churnOutcome.companyId, companyId), gt(churnOutcome.churnTimestamp, start), lte(churnOutcome.churnTimestamp, end))).orderBy(asc(churnOutcome.churnTimestamp));
  const churnedIds = new Set(churned.map((row: any) => row.customerId));
  const all = await db.select({ customerId: customer.customerId }).from(customer).where(eq(customer.companyId, companyId));
  return { churned: [...churnedIds] as string[], retained: all.map((row: any) => String(row.customerId)).filter((id: string) => !churnedIds.has(id)), unknown: [] };
}

export async function churnFeatures(db: any, companyId: string, customerIds: string[], start: Date, end: Date) {
  const rows = [];
  for (const customerId of customerIds) {
    const [contacts, issues, escalations, journeys] = await Promise.all([
      db.select({ value: event.eventId }).from(event).where(and(eq(event.companyId, companyId), eq(event.customerId, customerId), gt(event.eventTime, start), lte(event.eventTime, end))),
      db.select({ value: issue.issueId }).from(issue).where(and(eq(issue.companyId, companyId), eq(issue.customerId, customerId))),
      db.select({ value: escalation.escalationId }).from(escalation).where(and(eq(escalation.companyId, companyId), eq(escalation.customerId, customerId))),
      db.select({ value: journeyInstance.instanceId }).from(journeyInstance).where(and(eq(journeyInstance.companyId, companyId), eq(journeyInstance.customerId, customerId)))
    ]);
    rows.push({ customerId, contacts: contacts.length, issues: issues.length, escalations: escalations.length, journeys: journeys.length });
  }
  return rows;
}

export async function analyzeChurn(db: any, companyId: string, start: Date, end: Date) {
  const cohorts = await churnCohorts(db, companyId, start, end);
  if (!cohorts.churned.length) return { status: 'UNAVAILABLE', reason: 'NO_STRUCTURED_CHURN_OUTCOMES', cohorts };
  const [churned, retained] = await Promise.all([churnFeatures(db, companyId, cohorts.churned, start, end), churnFeatures(db, companyId, cohorts.retained, start, end)]);
  if (!retained.length) return { status: 'INSUFFICIENT_DATA', cohorts, churned, retained };
  const mean = (rows: any[], key: string) => rows.reduce((sum, row) => sum + row[key], 0) / rows.length;
  const features = ['contacts', 'issues', 'escalations', 'journeys'].map((key) => { const churnedMean = mean(churned, key); const retainedMean = mean(retained, key); return { feature: key, churnedMean, retainedMean, difference: churnedMean - retainedMean, associationOnly: true }; });
  return { status: 'AVAILABLE', cohorts, sampleSizes: { churned: churned.length, retained: retained.length }, features };
}

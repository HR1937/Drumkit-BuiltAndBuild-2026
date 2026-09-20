import { and, asc, eq, isNotNull } from 'drizzle-orm';
import { count } from 'drizzle-orm';
import { customer, event, escalation, identityResolution, issue, journeyInstance } from '../db/schema.js';

export async function analyticsOverview(db: any, companyId: string) {
  const [customers, events, issues, escalations, journeys, identities] = await Promise.all([
    db.select({ value: count() }).from(customer).where(eq(customer.companyId, companyId)),
    db.select({ value: count() }).from(event).where(eq(event.companyId, companyId)),
    db.select({ value: count() }).from(issue).where(and(eq(issue.companyId, companyId), isNotNull(issue.customerId))),
    db.select({ value: count() }).from(escalation).where(eq(escalation.companyId, companyId)),
    db.select({ value: count() }).from(journeyInstance).where(eq(journeyInstance.companyId, companyId)),
    db.select({ status: identityResolution.status, value: count() }).from(identityResolution).where(eq(identityResolution.companyId, companyId)).groupBy(identityResolution.status)
  ]);
  const identityCounts = Object.fromEntries(identities.map((row: any) => [row.status, Number(row.value)]));
  const eventRows = await db.select({ customerId: event.customerId, eventType: event.eventType, eventTime: event.eventTime }).from(event).where(and(eq(event.companyId, companyId), isNotNull(event.customerId))).orderBy(asc(event.eventTime));
  const contacts = new Map<string, number>(); for (const row of eventRows) contacts.set(row.customerId, (contacts.get(row.customerId) ?? 0) + 1);
  const repeatCustomers = [...contacts.values()].filter((value) => value > 1).length;
  return { status: eventRows.length || Number(customers[0]?.value) ? 'AVAILABLE' : 'EMPTY', metrics: { customers: Number(customers[0]?.value ?? 0), events: Number(events[0]?.value ?? 0), issues: Number(issues[0]?.value ?? 0), escalations: Number(escalations[0]?.value ?? 0), journeys: Number(journeys[0]?.value ?? 0), repeatCustomers, resolvedIdentities: identityCounts.RESOLVED ?? 0, ambiguousIdentities: identityCounts.AMBIGUOUS ?? 0, unresolvedIdentities: identityCounts.UNRESOLVED ?? 0 }, provenance: { tables: ['customer', 'event', 'issue', 'escalation', 'journey_instance', 'identity_resolution'], companyId } };
}

export async function customerIssues(db: any, companyId: string, customerId: string) { return db.select().from(issue).where(and(eq(issue.companyId, companyId), eq(issue.customerId, customerId))).orderBy(asc(issue.createdAt)); }
export async function customerEscalations(db: any, companyId: string, customerId: string) { return db.select().from(escalation).where(and(eq(escalation.companyId, companyId), eq(escalation.customerId, customerId))).orderBy(asc(escalation.occurredAt)); }
export async function customerJourneys(db: any, companyId: string, customerId: string) { return db.select().from(journeyInstance).where(and(eq(journeyInstance.companyId, companyId), eq(journeyInstance.customerId, customerId))).orderBy(asc(journeyInstance.startedAt)); }

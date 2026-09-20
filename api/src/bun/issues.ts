import { and, asc, eq, gte, isNotNull, or } from 'drizzle-orm';
import { complaint, event, issue } from '../db/schema.js';

export function normalizeComplaintTopic(topic: unknown) { return typeof topic === 'string' ? topic.trim().toLowerCase().replace(/\s+/g, ' ') || null : null; }

export async function groupComplaintIntoIssue(db: any, input: { companyId: string; customerId: string; eventId: string; topic: string; occurredAt: Date; channel: string | null; entityId?: string | null; windowDays?: number }) {
  const windowStart = new Date(input.occurredAt.getTime() - (input.windowDays ?? 30) * 86400000);
  const candidates = await db.select().from(issue).where(and(eq(issue.companyId, input.companyId), eq(issue.customerId, input.customerId), eq(issue.topic, input.topic), gte(issue.lastContactAt, windowStart), or(eq(issue.status, 'OPEN'), eq(issue.status, 'IN_PROGRESS'), eq(issue.status, 'ESCALATED'), eq(issue.status, 'REOPENED'), eq(issue.status, 'RESOLVED')))).orderBy(asc(issue.createdAt));
  const selected = candidates.find((candidate: any) => !input.entityId || !candidate.configuration?.entityId || candidate.configuration.entityId === input.entityId);
  const issueRow = selected ?? (await db.insert(issue).values({ companyId: input.companyId, customerId: input.customerId, topic: input.topic, status: 'OPEN', createdAt: input.occurredAt, lastContactAt: input.occurredAt, configuration: input.entityId ? { entityId: input.entityId } : {} }).returning())[0];
  await db.insert(complaint).values({ companyId: input.companyId, issueId: issueRow.issueId, customerId: input.customerId, eventId: input.eventId, topic: input.topic, occurredAt: input.occurredAt, channel: input.channel });
  const nextStatus = issueRow.status === 'RESOLVED' ? 'REOPENED' : issueRow.status;
  const [updated] = await db.update(issue).set({ lastContactAt: input.occurredAt, status: nextStatus, resolvedAt: nextStatus === 'REOPENED' ? null : issueRow.resolvedAt }).where(eq(issue.issueId, issueRow.issueId)).returning();
  return { issue: updated, created: !selected, reopened: nextStatus === 'REOPENED' };
}

export async function updateIssueStatus(db: any, companyId: string, issueId: string, status: string, resolutionNote?: string) {
  const allowed = new Set(['OPEN', 'IN_PROGRESS', 'ESCALATED', 'RESOLVED', 'REOPENED']); if (!allowed.has(status)) throw Object.assign(new Error('Invalid issue status'), { code: 'INVALID_INPUT' });
  const [row] = await db.update(issue).set({ status, resolvedAt: status === 'RESOLVED' ? new Date() : null, resolutionNote: resolutionNote ?? null }).where(and(eq(issue.companyId, companyId), eq(issue.issueId, issueId))).returning();
  if (!row) throw Object.assign(new Error('Issue not found'), { code: 'NOT_FOUND' }); return row;
}

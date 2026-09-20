import { and, eq } from 'drizzle-orm';
import { escalation, issue } from '../db/schema.js';

export function structuredEscalation(input: Record<string, unknown>) {
  if (input.escalation === true || input.escalationIndicator === true || input.supportLevelTransition === true || input.supervisorTransfer === true || input.escalationTeam === true) return { method: 'STRUCTURED', confidence: 1, evidence: { escalation: input.escalation, escalationIndicator: input.escalationIndicator, supportLevelTransition: input.supportLevelTransition, supervisorTransfer: input.supervisorTransfer, escalationTeam: input.escalationTeam } };
  return null;
}

export function inferredEscalation(text: unknown) {
  if (typeof text !== 'string') return null;
  const match = /(?:supervisor|manager|escalat(?:e|ed|ion)|complaint team)/i.test(text);
  return match ? { method: 'INFERRED', confidence: 0.5, evidence: { matched: 'escalation-language' } } : null;
}

export async function persistEscalation(db: any, input: { companyId: string; customerId: string; eventId: string; issueId?: string | null; occurredAt: Date; payload: Record<string, unknown> }) {
  const detection = structuredEscalation(input.payload) ?? inferredEscalation(input.payload.transcript ?? input.payload.content);
  if (!detection) return { created: false, reason: 'NO_ESCALATION_SIGNAL' };
  const [existing] = await db.select({ escalationId: escalation.escalationId }).from(escalation).where(and(eq(escalation.companyId, input.companyId), eq(escalation.eventId, input.eventId), eq(escalation.customerId, input.customerId)));
  if (existing) return { created: false, escalationId: existing.escalationId, reason: 'DUPLICATE' };
  const [row] = await db.insert(escalation).values({ companyId: input.companyId, customerId: input.customerId, eventId: input.eventId, issueId: input.issueId ?? null, detectionMethod: detection.method, confidence: String(detection.confidence), evidence: { ...detection.evidence, fromLevel: input.payload.fromLevel ?? null, toLevel: input.payload.toLevel ?? null, reason: input.payload.reason ?? null }, occurredAt: input.occurredAt }).returning();
  return { created: true, escalation: row };
}

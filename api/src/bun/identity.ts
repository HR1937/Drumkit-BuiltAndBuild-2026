import { and, eq, or } from 'drizzle-orm';
import { event, identityMapping, identityResolution } from '../db/schema.js';

export type IdentityStatus = 'RESOLVED' | 'AMBIGUOUS' | 'UNRESOLVED';

export async function resolveEventIdentity(db: any, input: {
  companyId: string;
  eventId: string;
  canonicalCustomerId?: string | null;
  identifiers?: Record<string, unknown>;
}) {
  const [existing] = await db.select().from(identityResolution).where(and(eq(identityResolution.companyId, input.companyId), eq(identityResolution.eventId, input.eventId)));
  if (existing) {
    const evidence = (existing.evidence ?? {}) as Record<string, unknown>;
    return { status: existing.status as IdentityStatus, customerId: existing.customerId, candidates: Array.isArray(evidence.candidates) ? evidence.candidates as string[] : [], resolution: existing };
  }
  const identifiers = input.identifiers ?? {};
  let customerId = input.canonicalCustomerId ?? null;
  let status: IdentityStatus = customerId ? 'RESOLVED' : 'UNRESOLVED';
  let method = customerId ? 'DIRECT_CANONICAL_ID' : 'NO_IDENTIFIER';
  let candidates: string[] = customerId ? [customerId] : [];

  const predicates = Object.entries(identifiers)
    .filter(([, value]) => typeof value === 'string' && value.length > 0)
    .map(([kind, value]) => and(
      eq(identityMapping.identifierType, kind),
      eq(identityMapping.identifierValue, String(value)),
      eq(identityMapping.active, true)
    ));
  if (!customerId && predicates.length) {
    const rows = await db.select({ customerId: identityMapping.customerId })
      .from(identityMapping)
      .where(and(eq(identityMapping.companyId, input.companyId), or(...predicates)));
    candidates = [...new Set<string>(rows.map((row: any) => String(row.customerId)))];
    status = candidates.length === 1 ? 'RESOLVED' : candidates.length > 1 ? 'AMBIGUOUS' : 'UNRESOLVED';
    method = 'SOURCE_IDENTIFIER';
    customerId = status === 'RESOLVED' ? candidates[0] : null;
  }

  if (customerId) await db.update(event).set({ customerId }).where(and(eq(event.companyId, input.companyId), eq(event.eventId, input.eventId)));
  const [resolution] = await db.insert(identityResolution).values({
    companyId: input.companyId,
    eventId: input.eventId,
    customerId,
    status,
    method,
    confidence: status === 'RESOLVED' ? '1' : null,
    evidence: { identifiers, candidates }
  }).returning();
  return { status, customerId, candidates, resolution };
}

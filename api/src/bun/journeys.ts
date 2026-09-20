import { and, asc, eq, or } from 'drizzle-orm';
import { event, journeyDefinition, journeyEventMapping, journeyInstance, journeyInstanceStage, journeyStageDefinition } from '../db/schema.js';

type Db = any;

export async function evaluateJourneyEvent(db: Db, input: { companyId: string; eventId: string; customerId: string | null; eventType: string; eventTime: Date; entityType: string | null; entityId: string | null }) {
  if (!input.customerId) return { status: 'UNRESOLVED', instances: [] };
  const definitions = await db.select().from(journeyDefinition).where(and(eq(journeyDefinition.companyId, input.companyId), eq(journeyDefinition.status, 'ACTIVE')));
  const touched: unknown[] = [];
  for (const definition of definitions) {
    const configuration = (definition.configuration ?? {}) as Record<string, unknown>;
    const isStart = configuration.startEventType === input.eventType;
    const entityFilters: any[] = [eq(journeyInstance.companyId, input.companyId), eq(journeyInstance.journeyId, definition.journeyId), eq(journeyInstance.customerId, input.customerId), or(eq(journeyInstance.status, 'ACTIVE'), eq(journeyInstance.status, 'DROPPED_OFF'))];
    entityFilters.push(input.entityType ? eq(journeyInstance.entityType as any, input.entityType) : eq(journeyInstance.entityType as any, null));
    entityFilters.push(input.entityId ? eq(journeyInstance.entityId as any, input.entityId) : eq(journeyInstance.entityId as any, null));
    let [instance] = await db.select().from(journeyInstance).where(and(...entityFilters)).orderBy(asc(journeyInstance.startedAt));
    if (isStart && !instance) {
      [instance] = await db.insert(journeyInstance).values({ companyId: input.companyId, journeyId: definition.journeyId, customerId: input.customerId, entityType: input.entityType, entityId: input.entityId, status: 'ACTIVE', startedAt: input.eventTime }).returning();
    }
    if (!instance) continue;
    const mappings = await db.select({ stage: journeyStageDefinition, mapping: journeyEventMapping }).from(journeyEventMapping).innerJoin(journeyStageDefinition, eq(journeyEventMapping.stageId, journeyStageDefinition.stageId)).where(eq(journeyStageDefinition.journeyId, definition.journeyId)).orderBy(asc(journeyStageDefinition.ordinal));
    const matches = mappings.filter((row: any) => row.mapping.eventType === input.eventType);
    for (const match of matches) {
      await db.insert(journeyInstanceStage).values({ instanceId: instance.instanceId, stageId: match.stage.stageId, status: 'COMPLETED', reachedAt: input.eventTime, completedAt: input.eventTime }).onConflictDoUpdate({ target: [journeyInstanceStage.instanceId, journeyInstanceStage.stageId], set: { status: 'COMPLETED', reachedAt: input.eventTime, completedAt: input.eventTime } });
    }
    const stages = mappings.map((row: any) => row.stage);
    const completed = stages.length > 0 && stages.every((stage: any) => stage.required === false || matches.some((match: any) => match.stage.stageId === stage.stageId));
    if (configuration.completionEventType === input.eventType || completed) await db.update(journeyInstance).set({ status: 'COMPLETED', completedAt: input.eventTime, droppedOffAt: null, dropoffStageId: null }).where(eq(journeyInstance.instanceId, instance.instanceId));
    if (configuration.abandonmentEventType === input.eventType) await db.update(journeyInstance).set({ status: 'ABANDONED', completedAt: input.eventTime, droppedOffAt: null, dropoffStageId: null }).where(eq(journeyInstance.instanceId, instance.instanceId));
    touched.push(instance.instanceId);
  }
  for (const instanceId of touched) await recomputeJourney(db, input.companyId, String(instanceId), new Date(Math.max(Date.now(), input.eventTime.getTime())));
  return { status: touched.length ? 'PROCESSED' : 'NO_MATCH', instances: touched };
}

export function calculateDropoff(input: { reachedAt: Date | null; timeoutSeconds: number | null; nextReachedAt?: Date | null; evaluatedAt: Date; hasExpectedProgression: boolean }) {
  if (!input.reachedAt || !input.timeoutSeconds || input.timeoutSeconds <= 0 || !input.hasExpectedProgression) return { droppedOff: false, reason: 'NOT_CONFIGURED' };
  const deadline = new Date(input.reachedAt.getTime() + input.timeoutSeconds * 1000);
  if (input.nextReachedAt && input.nextReachedAt.getTime() <= deadline.getTime()) return { droppedOff: false, reason: 'PROGRESSED', deadline };
  return input.evaluatedAt.getTime() >= deadline.getTime() ? { droppedOff: true, reason: 'TIMEOUT', deadline } : { droppedOff: false, reason: 'PENDING', deadline };
}

export async function recomputeJourney(db: Db, companyId: string, instanceId: string, evaluatedAt = new Date()) {
  const [instance] = await db.select().from(journeyInstance).where(and(eq(journeyInstance.companyId, companyId), eq(journeyInstance.instanceId, instanceId))); if (!instance) return null;
  const definitions = await db.select().from(journeyStageDefinition).where(eq(journeyStageDefinition.journeyId, instance.journeyId)).orderBy(asc(journeyStageDefinition.ordinal));
  const states = await db.select().from(journeyInstanceStage).where(eq(journeyInstanceStage.instanceId, instanceId)); const stateByStage = new Map<string, any>(states.map((row: any) => [row.stageId, row]));
  let dropoff: any = null;
  for (let index = 0; index < definitions.length - 1; index++) { const stage = definitions[index]; const state: any = stateByStage.get(stage.stageId); const next = definitions[index + 1]; const nextState: any = stateByStage.get(next.stageId); const result = calculateDropoff({ reachedAt: state?.reachedAt ?? null, timeoutSeconds: stage.timeoutSeconds, nextReachedAt: nextState?.reachedAt ?? null, evaluatedAt, hasExpectedProgression: Boolean(next) }); if (result.droppedOff) { dropoff = { stageId: stage.stageId, at: result.deadline }; break; } }
  if (instance.status === 'ABANDONED') return { instanceId, completed: false, dropoff: null, terminal: 'ABANDONED' };
  const completedRequired = definitions.filter((stage: any) => stage.required).every((stage: any) => stateByStage.get(stage.stageId)?.status === 'COMPLETED');
  if (completedRequired && definitions.length) await db.update(journeyInstance).set({ status: 'COMPLETED', completedAt: [...states].sort((a: any, b: any) => new Date(b.completedAt ?? 0).getTime() - new Date(a.completedAt ?? 0).getTime())[0]?.completedAt ?? evaluatedAt, droppedOffAt: null, dropoffStageId: null }).where(eq(journeyInstance.instanceId, instanceId));
  else if (dropoff) await db.update(journeyInstance).set({ status: 'DROPPED_OFF', droppedOffAt: dropoff.at, dropoffStageId: dropoff.stageId, completedAt: null }).where(eq(journeyInstance.instanceId, instanceId));
  else if (instance.status === 'DROPPED_OFF') await db.update(journeyInstance).set({ status: 'ACTIVE', droppedOffAt: null, dropoffStageId: null }).where(eq(journeyInstance.instanceId, instanceId));
  return { instanceId, completed: completedRequired, dropoff };
}

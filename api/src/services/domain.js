export function resolveIdentity({ canonicalId, mappings = [], entityMatches = [], secondaryMatches = [] }) {
  if (canonicalId) return { status: "RESOLVED", method: "DIRECT_CANONICAL_ID", customerId: canonicalId, confidence: 1, evidence: { canonicalId } };
  const uniqueMappings = [...new Map(mappings.map((item) => [item.customerId, item])).values()];
  if (uniqueMappings.length === 1) return { status: "RESOLVED", method: "SOURCE_IDENTIFIER_MAPPING", customerId: uniqueMappings[0].customerId, confidence: uniqueMappings[0].confidence ?? 1, evidence: { mapping: uniqueMappings[0] } };
  if (uniqueMappings.length > 1) return { status: "AMBIGUOUS", method: "CONFLICT", customerId: null, confidence: null, evidence: { candidates: uniqueMappings } };
  if (entityMatches.length === 1) return { status: "RESOLVED", method: "BUSINESS_ENTITY_RELATIONSHIP", customerId: entityMatches[0].customerId, confidence: entityMatches[0].confidence ?? 1, evidence: { entity: entityMatches[0] } };
  if (entityMatches.length > 1) return { status: "AMBIGUOUS", method: "CONFLICT", customerId: null, confidence: null, evidence: { candidates: entityMatches } };
  if (secondaryMatches.length === 1) return { status: "RESOLVED", method: "SECONDARY_EVIDENCE", customerId: secondaryMatches[0].customerId, confidence: secondaryMatches[0].confidence, evidence: { secondary: secondaryMatches[0] } };
  return { status: "UNRESOLVED", method: "UNRESOLVED", customerId: null, confidence: null, evidence: { secondaryCandidates: secondaryMatches } };
}

export function evaluateJourney({ definition, events }) {
  if (!definition?.startEventType) return { status: "UNAVAILABLE", instances: [] };
  const ordered = [...events].filter((event) => event.event_time && event.event_type).sort((a, b) => new Date(a.event_time) - new Date(b.event_time) || String(a.event_id).localeCompare(String(b.event_id)));
  const instances = [];
  for (const start of ordered.filter((event) => event.event_type === definition.startEventType)) {
    const stages = (definition.stages || []).slice().sort((a, b) => a.ordinal - b.ordinal); const reached = []; let cursor = new Date(start.event_time);
    for (const stage of stages) { const hit = ordered.find((event) => new Date(event.event_time) >= cursor && (stage.eventTypes || []).includes(event.event_type)); if (hit) { reached.push({ stageKey: stage.stageKey, status: "COMPLETED", eventId: hit.event_id, eventTime: hit.event_time }); cursor = new Date(hit.event_time); } else reached.push({ stageKey: stage.stageKey, status: "NOT_REACHED", eventId: null, eventTime: null }); }
    const requiredMissing = reached.some((stage, index) => stages[index].required && stage.status !== "COMPLETED"); const completed = !requiredMissing && stages.some((stage) => stage.required);
    instances.push({ startEventId: start.event_id, startedAt: start.event_time, status: completed ? "COMPLETED" : "ACTIVE", stages: reached });
  }
  return { status: instances.length ? "AVAILABLE" : "EMPTY", instances };
}

export function structuredChurnOutcome(record) { if (!record?.customerId || !record.churnTimestamp || !record.source) return null; return { customerId: record.customerId, churnType: record.churnType || "CONFIGURED", churnTimestamp: record.churnTimestamp, source: record.source, sourceReference: record.sourceReference || null, recordedReason: record.recordedReason || null }; }

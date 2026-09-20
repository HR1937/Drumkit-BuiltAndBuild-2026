export type FieldMapping = { sourceField: string; semanticField: string; required?: boolean };

function readPath(value: Record<string, unknown>, path: string) {
  return path.split('.').reduce<unknown>((current, key) => current && typeof current === 'object' && !Array.isArray(current) ? (current as Record<string, unknown>)[key] : undefined, value);
}

export function normalizeSourcePayload(payload: Record<string, unknown>, mappings: FieldMapping[]) {
  const normalized: Record<string, unknown> = { ...payload };
  const identifiers = payload.identifiers && typeof payload.identifiers === 'object' && !Array.isArray(payload.identifiers) ? { ...(payload.identifiers as Record<string, unknown>) } : {};
  const missing: string[] = [];
  for (const mapping of mappings) {
    const value = readPath(payload, mapping.sourceField);
    if ((value === undefined || value === null || value === '') && mapping.required) missing.push(mapping.sourceField);
    if (value === undefined) continue;
    const semantic = mapping.semanticField;
    if (semantic === 'event_type') normalized.eventType = value;
    else if (semantic === 'event_time') normalized.eventTime = value;
    else if (semantic === 'source_event_id') normalized.sourceEventId = value;
    else if (semantic === 'channel') normalized.channel = value;
    else if (semantic === 'topic') normalized.topic = value;
    else if (semantic === 'session_reference') normalized.sessionId = value;
    else if (semantic === 'entity_type') normalized.entityType = value;
    else if (semantic === 'entity_id') normalized.entityId = value;
    else if (semantic === 'escalation_indicator') normalized.escalationIndicator = value;
    else if (semantic === 'transcript' || semantic === 'content') normalized[semantic] = value;
    else if (semantic.endsWith('_reference') || semantic === 'customer_reference') identifiers[semantic] = value;
    else normalized[semantic] = value;
  }
  normalized.identifiers = identifiers;
  return { normalized, missing };
}

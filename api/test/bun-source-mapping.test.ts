import { expect, test } from 'bun:test';
import { normalizeSourcePayload } from '../src/bun/source-mapping.js';

test('source mappings normalize company-specific payload names', () => {
  const result = normalizeSourcePayload({ kind: 'CONTACT', happened: '2026-01-01T00:00:00Z', account_no: 'A-1' }, [{ sourceField: 'kind', semanticField: 'event_type', required: true }, { sourceField: 'happened', semanticField: 'event_time', required: true }, { sourceField: 'account_no', semanticField: 'account_reference' }]);
  expect(result.missing).toEqual([]); expect(result.normalized.eventType).toBe('CONTACT'); expect((result.normalized.identifiers as any).account_reference).toBe('A-1');
});
test('required mapped values are rejected deterministically', () => expect(normalizeSourcePayload({}, [{ sourceField: 'kind', semanticField: 'event_type', required: true }]).missing).toEqual(['kind']));

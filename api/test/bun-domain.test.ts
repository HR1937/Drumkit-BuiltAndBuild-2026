import { expect, test } from 'bun:test';
import { inferredEscalation, structuredEscalation } from '../src/bun/escalations.js';
import { normalizeComplaintTopic } from '../src/bun/issues.js';

test('structured escalation takes explicit configured signals only', () => {
  expect(structuredEscalation({ supervisorTransfer: true })?.method).toBe('STRUCTURED');
  expect(structuredEscalation({ transfer: true })).toBeNull();
});

test('text escalation inference is marked inferred and bounded confidence', () => {
  expect(inferredEscalation('Please escalate this to a manager')).toMatchObject({ method: 'INFERRED', confidence: 0.5 });
  expect(inferredEscalation('Transferred to billing')).toBeNull();
});

test('complaint topics normalize deterministically', () => expect(normalizeComplaintTopic('  Payment   Failed ')).toBe('payment failed'));

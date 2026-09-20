import { expect, test } from 'bun:test';
import { calculateDropoff } from '../src/bun/journeys.js';

const reachedAt = new Date('2026-01-01T00:00:00Z');
test('configured reached stage times out into drop-off', () => expect(calculateDropoff({ reachedAt, timeoutSeconds: 3600, evaluatedAt: new Date('2026-01-01T02:00:00Z'), hasExpectedProgression: true }).droppedOff).toBe(true));
test('progression before deadline prevents drop-off', () => expect(calculateDropoff({ reachedAt, timeoutSeconds: 3600, nextReachedAt: new Date('2026-01-01T00:30:00Z'), evaluatedAt: new Date('2026-01-01T02:00:00Z'), hasExpectedProgression: true }).reason).toBe('PROGRESSED'));
test('absence without configured expected progression never becomes drop-off', () => expect(calculateDropoff({ reachedAt, timeoutSeconds: 3600, evaluatedAt: new Date('2026-01-01T02:00:00Z'), hasExpectedProgression: false }).droppedOff).toBe(false));
test('late progression invalidates a prior timeout evaluation', () => expect(calculateDropoff({ reachedAt, timeoutSeconds: 3600, nextReachedAt: new Date('2026-01-01T00:45:00Z'), evaluatedAt: new Date('2026-01-02T00:00:00Z'), hasExpectedProgression: true }).droppedOff).toBe(false));

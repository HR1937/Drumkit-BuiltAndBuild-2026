import { expect, test } from 'bun:test';
import { artifactFilename, renderArtifact } from '../src/bun/artifacts.js';

const snapshot = { reportType: 'IDENTITY_DATA_QUALITY', status: 'AVAILABLE', generatedAt: '2026-09-20T00:00:00.000Z', metrics: { resolved: 8, unresolved: 2 }, limitations: [] };
test('all four report artifact formats render real bytes', async () => {
  for (const format of ['json', 'csv', 'pdf', 'docx'] as const) expect((await renderArtifact(format, snapshot)).length).toBeGreaterThan(20);
});
test('artifact filenames are contextual and contain no customer identity', () => {
  const name = artifactFilename('Breeze Demo Retail', 'Identity Data Quality', 'run-1', new Date('2026-09-20T00:00:00Z'), 'pdf');
  expect(name).toBe('breeze-breeze-demo-retail-identity-data-quality-run-1-20260920T000000Z.pdf');
});

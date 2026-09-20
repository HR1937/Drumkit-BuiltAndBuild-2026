import { expect, test } from 'bun:test';

test('Neon domain and exact 13-tool MCP vertical integration', async () => {
  if (!process.env.DATABASE_URL) return;
  const processRun = Bun.spawn([process.execPath, 'run', 'src/bun/integration-domain.ts'], { cwd: process.cwd(), env: process.env, stdout: 'pipe', stderr: 'pipe' });
  const [stdout, stderr, exitCode] = await Promise.all([new Response(processRun.stdout).text(), new Response(processRun.stderr).text(), processRun.exited]);
  if (exitCode !== 0) throw new Error(`integration-domain failed: ${stderr}`);
  const line = stdout.trim().split(/\r?\n/).filter(Boolean).at(-1);
  const result = JSON.parse(line ?? '{}');
  expect(result.passed).toBe(true);
  expect(result.identity).toEqual({ ambiguous: 'AMBIGUOUS', unresolved: 'UNRESOLVED' });
  expect(result.journeys).toMatchObject({ lateCorrection: 'COMPLETED', completed: true, abandoned: true });
  expect(result.issue).toBe('REOPENED');
  expect(result.escalation).toEqual({ deduplicated: true, inferred: 'INFERRED' });
  expect(result.churn.status).toBe('AVAILABLE');
  expect(result.mcp.count).toBe(13);
  expect(Object.keys(result.mcp.results)).toHaveLength(13);
  expect(result.mcp.invalidInput).toBe(400);
  expect(result.mcp.tenantIsolation).toBe(404);
}, 120_000);

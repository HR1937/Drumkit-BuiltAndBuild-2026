import { afterAll, beforeAll, expect, test } from 'bun:test';
import { rm } from 'node:fs/promises';
import path from 'node:path';

const authPath = path.resolve(process.cwd(), 'data', 'auth-test.json');
process.env.AUTH_STORE_PATH = authPath;
const auth = await import('../src/bun/auth.js');

beforeAll(async () => { await rm(authPath, { force: true }); });
afterAll(async () => { await rm(authPath, { force: true }); });

test('Breeze auth registers, hashes, logs in, resolves and logs out', async () => {
  const account = await auth.registerAccount({ companyId: crypto.randomUUID(), email: 'Admin@Example.com', password: 'long-password-123', displayName: 'Admin' });
  expect(account.email).toBe('admin@example.com');
  await expect(auth.registerAccount({ companyId: crypto.randomUUID(), email: 'admin@example.com', password: 'long-password-123', displayName: 'Other' })).rejects.toMatchObject({ code: 'DUPLICATE_EMAIL' });
  await expect(auth.loginAccount('admin@example.com', 'wrong-password')).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS' });
  const login = await auth.loginAccount('admin@example.com', 'long-password-123');
  expect((await auth.resolveSession(login.session.token))?.account.companyId).toBe(account.companyId);
  await auth.logoutSession(login.session.token);
  expect(await auth.resolveSession(login.session.token)).toBeNull();
});

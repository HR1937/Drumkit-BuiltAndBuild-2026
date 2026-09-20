import argon2 from 'argon2';
import { randomBytes, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type AuthAccount = { accountId: string; companyId: string; email: string; displayName: string; passwordHash: string; createdAt: string };
export type AuthSession = { token: string; accountId: string; companyId: string; expiresAt: string };
type AuthStore = { accounts: AuthAccount[]; sessions: AuthSession[] };

const storePath = process.env.AUTH_STORE_PATH ?? path.resolve(process.cwd(), 'data', 'auth-store.json');
const emptyStore = (): AuthStore => ({ accounts: [], sessions: [] });

async function readStore(): Promise<AuthStore> {
  try { return JSON.parse(await readFile(storePath, 'utf8')) as AuthStore; } catch (error: any) { if (error?.code === 'ENOENT') return emptyStore(); throw error; }
}
async function writeStore(store: AuthStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  const tmp = `${storePath}.${process.pid}.tmp`; await writeFile(tmp, JSON.stringify(store, null, 2), 'utf8'); await rename(tmp, storePath);
}
export function normalizeEmail(value: unknown) { return typeof value === 'string' ? value.trim().toLowerCase() : ''; }
export function validatePassword(value: unknown) { return typeof value === 'string' && value.length >= 10 && value.length <= 200; }

export async function registerAccount(input: { companyId: string; email: string; password: string; displayName: string }) {
  const email = normalizeEmail(input.email); if (!email || !validatePassword(input.password)) throw Object.assign(new Error('Invalid registration'), { code: 'INVALID_INPUT' });
  const store = await readStore(); if (store.accounts.some((row) => row.email === email)) throw Object.assign(new Error('Account already exists'), { code: 'DUPLICATE_EMAIL' });
  const account: AuthAccount = { accountId: randomUUID(), companyId: input.companyId, email, displayName: input.displayName.trim(), passwordHash: await argon2.hash(input.password, { type: argon2.argon2id }), createdAt: new Date().toISOString() };
  store.accounts.push(account); await writeStore(store); return { accountId: account.accountId, companyId: account.companyId, email: account.email, displayName: account.displayName };
}
export async function loginAccount(emailInput: unknown, password: unknown, ttlMs = 8 * 60 * 60 * 1000) {
  const email = normalizeEmail(emailInput); const store = await readStore(); const account = store.accounts.find((row) => row.email === email);
  if (!account || typeof password !== 'string' || !(await argon2.verify(account.passwordHash, password))) throw Object.assign(new Error('Invalid credentials'), { code: 'INVALID_CREDENTIALS' });
  const session: AuthSession = { token: randomBytes(32).toString('base64url'), accountId: account.accountId, companyId: account.companyId, expiresAt: new Date(Date.now() + ttlMs).toISOString() };
  store.sessions = store.sessions.filter((row) => new Date(row.expiresAt).getTime() > Date.now()); store.sessions.push(session); await writeStore(store); return { session, account: { accountId: account.accountId, companyId: account.companyId, email: account.email, displayName: account.displayName } };
}
export async function resolveSession(token: string | undefined) {
  if (!token) return null; const store = await readStore(); const session = store.sessions.find((row) => row.token === token); if (!session || new Date(session.expiresAt).getTime() <= Date.now()) return null;
  const account = store.accounts.find((row) => row.accountId === session.accountId); return account ? { session, account: { accountId: account.accountId, companyId: account.companyId, email: account.email, displayName: account.displayName } } : null;
}
export async function logoutSession(token: string | undefined) { if (!token) return; const store = await readStore(); store.sessions = store.sessions.filter((row) => row.token !== token); await writeStore(store); }

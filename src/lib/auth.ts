import { cookies } from 'next/headers';
import crypto from 'node:crypto';

const COOKIE_NAME = 'mp_session';
const MAX_AGE = 60 * 60 * 24 * 180; // 180 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET אינו מוגדר. יש להגדיר אותו במשתני הסביבה של הפרויקט.');
  }
  return secret;
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function sign(value: string): string {
  const h = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  return `${value}.${h}`;
}

function verify(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  return timingSafeEqualStrings(sig, expected);
}

export function checkPin(pin: string): boolean {
  const real = process.env.ADMIN_PIN;
  if (!real) {
    throw new Error('ADMIN_PIN אינו מוגדר. יש להגדיר אותו במשתני הסביבה של הפרויקט.');
  }
  return timingSafeEqualStrings(pin, real);
}

export async function createSession(): Promise<void> {
  const token = sign('authenticated');
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return verify(token);
}

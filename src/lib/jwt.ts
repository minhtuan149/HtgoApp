import * as jose from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-super-secret-key-change-me-in-production';
const encodedSecret = new TextEncoder().encode(JWT_SECRET);

export async function signJWT(payload: { userId: string; email: string }): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d') // Session expires in 7 days
    .sign(encodedSecret);
}

export async function verifyJWT(token: string): Promise<{ userId: string; email: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, encodedSecret);
    return payload as { userId: string; email: string };
  } catch (err) {
    return null;
  }
}

import { cookies } from 'next/headers';

export async function getSessionUser(): Promise<{ userId: string; email: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;
  return verifyJWT(token);
}

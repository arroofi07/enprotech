import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

import type { SessionPayload, SessionUser } from "@/lib/domain/auth/types";
import { toSessionUser } from "@/lib/domain/auth/types";

export const SESSION_COOKIE_NAME = "session";

function getSessionSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }

  return new TextEncoder().encode(secret);
}

function getSessionMaxAge(): number {
  const maxAge = Number(process.env.SESSION_MAX_AGE ?? 60 * 60 * 24 * 7);
  return Number.isFinite(maxAge) ? maxAge : 60 * 60 * 24 * 7;
}

function toPayload(user: SessionUser): SessionPayload {
  return {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  };
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const maxAge = getSessionMaxAge();

  return new SignJWT(toPayload(user))
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(getSessionSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    const sessionPayload = payload as SessionPayload;

    if (
      !sessionPayload.sub ||
      !sessionPayload.email ||
      !sessionPayload.name ||
      !sessionPayload.role ||
      !sessionPayload.status
    ) {
      return null;
    }

    return toSessionUser(sessionPayload);
  } catch {
    return null;
  }
}

export async function createSession(user: SessionUser): Promise<void> {
  const token = await createSessionToken(user);
  const cookieStore = await cookies();
  const maxAge = getSessionMaxAge();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifySessionToken(token);
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

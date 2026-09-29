/**
 * Server-side session helpers. Uses a signed cookie (HMAC-SHA256) to store
 * session data. The cookie is httpOnly, sameSite=lax, and expires after 8 hours.
 *
 * PROTOTYPE ONLY: In production, replace with a proper session store or JWT
 * issued by your identity provider.
 */

import { cookies } from "next/headers";
import type { UserSession } from "./types";

const COOKIE_NAME = "bdea_session";
const SECRET = "bdea-prototype-secret-key-2026-replace-in-production";
const SESSION_DURATION_SECONDS = 8 * 60 * 60; // 8 hours

/** Simple HMAC-like signature using Web Crypto (works in Edge runtime). */
async function sign(payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

/** Verify HMAC signature. */
async function verify(payload: string, signatureB64: string): Promise<boolean> {
  const expected = await sign(payload);
  return expected === signatureB64;
}

/** Create a signed session cookie. */
export async function createSession(
  session: Omit<UserSession, "exp">,
): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload: UserSession = { ...session, exp };
  const payloadStr = btoa(JSON.stringify(payload));
  const signature = await sign(payloadStr);
  const cookieValue = `${payloadStr}.${signature}`;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

/** Read and validate the session from the cookie. Returns null if invalid/expired. */
export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;

  const parts = cookie.value.split(".");
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;
  const valid = await verify(payloadStr, signature);
  if (!valid) return null;

  try {
    const session: UserSession = JSON.parse(atob(payloadStr));
    // Check expiry
    if (session.exp < Math.floor(Date.now() / 1000)) {
      await clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

/** Clear the session cookie. */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

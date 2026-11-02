import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "./db";

const COOKIE = "rg_session";
export type Role = "OWNER" | "TECH";
export type SessionUser = { id: number; role: Role; name: string; email: string; must_change: number };

function key() {
  const s = process.env.SESSION_SECRET;
  if (s && s.length >= 32) return new TextEncoder().encode(s);
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set (32+ characters).");
  return new TextEncoder().encode("dev-only-secret-change-me-0123456789abcdef");
}

export async function createSession(userId: number, tokenVersion: number) {
  const token = await new SignJWT({ uid: userId, tv: tokenVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

// Every request re-checks the database, so deactivating a user or bumping
// token_version revokes their sessions immediately.
export async function getUser(): Promise<SessionUser | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, key());
    const u = db()
      .prepare("SELECT id,role,name,email,must_change,active,token_version FROM users WHERE id=?")
      .get(payload.uid as number) as
      | { id: number; role: Role; name: string; email: string; must_change: number; active: number; token_version: number }
      | undefined;
    if (!u || !u.active || u.token_version !== payload.tv) return null;
    return { id: u.id, role: u.role, name: u.name, email: u.email, must_change: u.must_change };
  } catch {
    return null;
  }
}

export async function requireRole(role: Role): Promise<SessionUser> {
  const u = await getUser();
  if (!u) redirect("/login");
  if (u.role !== role) redirect(u.role === "OWNER" ? "/owner" : "/tech");
  if (u.must_change) redirect("/account/password");
  return u;
}

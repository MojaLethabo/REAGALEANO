import bcrypt from "bcryptjs";
import crypto from "node:crypto";

export const hash = (p: string) => bcrypt.hashSync(p, 12);
export const verify = (p: string, h: string) => bcrypt.compareSync(p, h);
export const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 12);

export function tempPassword(): string {
  const c = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = crypto.randomBytes(12);
  let s = "";
  for (let i = 0; i < 12; i++) s += c[b[i] % c.length];
  return s;
}

// Simple in-memory limiter. Fine for one server instance; use Redis if you scale out.
const hits = new Map<string, { n: number; t: number }>();
export function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const h = hits.get(key);
  if (!h || now - h.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return false;
  }
  h.n++;
  return h.n > max;
}
export const clearLimit = (key: string) => void hits.delete(key);

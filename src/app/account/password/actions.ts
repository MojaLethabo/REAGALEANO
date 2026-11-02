"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { hash, verify } from "@/lib/auth";
import { createSession, getUser } from "@/lib/session";

export type PwState = { error?: string };

export async function changePassword(_prev: PwState, fd: FormData): Promise<PwState> {
  const u = await getUser();
  if (!u) redirect("/login");
  const cur = String(fd.get("current") ?? ""), next = String(fd.get("next") ?? ""), conf = String(fd.get("confirm") ?? "");
  if (next.length < 10) return { error: "Use at least 10 characters." };
  if (next !== conf) return { error: "The new passwords do not match." };
  if (next === cur) return { error: "The new password must be different." };
  const row = db().prepare("SELECT password_hash,token_version FROM users WHERE id=?").get(u.id) as { password_hash: string; token_version: number };
  if (!verify(cur, row.password_hash)) return { error: "Your current password is incorrect." };
  const tv = row.token_version + 1; // signs out every other device
  db().prepare("UPDATE users SET password_hash=?,must_change=0,token_version=? WHERE id=?").run(hash(next), tv, u.id);
  await createSession(u.id, tv);
  redirect(u.role === "OWNER" ? "/owner" : "/tech");
}

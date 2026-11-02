"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { verify, DUMMY_HASH, limited, clearLimit } from "@/lib/auth";
import { createSession, destroySession } from "@/lib/session";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, fd: FormData): Promise<LoginState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const pass = String(fd.get("password") ?? "");
  const ip = ((await headers()).get("x-forwarded-for") || "local").split(",")[0].trim();
  const k = `login:${ip}:${email}`;
  if (limited(k, 8, 15 * 60 * 1000)) return { error: "Too many attempts. Try again in 15 minutes." };

  const u = db().prepare("SELECT id,role,password_hash,active,token_version FROM users WHERE email=?").get(email) as
    | { id: number; role: string; password_hash: string; active: number; token_version: number } | undefined;
  const ok = verify(pass, u?.password_hash ?? DUMMY_HASH); // same cost whether or not the user exists
  if (!u || !u.active || !ok) return { error: "Incorrect email or password." };

  clearLimit(k);
  await createSession(u.id, u.token_version);
  redirect(u.role === "OWNER" ? "/owner" : "/tech");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

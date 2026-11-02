"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { hash, tempPassword } from "@/lib/auth";

export type TechState = { error?: string; temp?: string; who?: string };
const str = (v: FormDataEntryValue | null, max = 120) => String(v ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createTech(_p: TechState, fd: FormData): Promise<TechState> {
  await requireRole("OWNER");
  const name = str(fd.get("name")), email = str(fd.get("email")).toLowerCase(), phone = str(fd.get("phone"), 30);
  if (!name) return { error: "Enter a name." };
  if (!EMAIL.test(email)) return { error: "Enter a valid email." };
  if (db().prepare("SELECT 1 FROM users WHERE email=?").get(email)) return { error: "That email is already in use." };
  const temp = tempPassword();
  db().prepare("INSERT INTO users(role,name,email,phone,password_hash,must_change) VALUES('TECH',?,?,?,?,1)").run(name, email, phone, hash(temp));
  revalidatePath("/owner/technicians");
  return { temp, who: name }; // shown once; only the hash is stored
}

export async function resetTech(_p: TechState, fd: FormData): Promise<TechState> {
  await requireRole("OWNER");
  const id = Number(fd.get("id"));
  const u = db().prepare("SELECT name FROM users WHERE id=? AND role='TECH'").get(id) as { name: string } | undefined;
  if (!u) return { error: "Technician not found." };
  const temp = tempPassword();
  // Bumping token_version signs the technician out everywhere.
  db().prepare("UPDATE users SET password_hash=?,must_change=1,token_version=token_version+1 WHERE id=?").run(hash(temp), id);
  revalidatePath("/owner/technicians");
  return { temp, who: u.name };
}

export async function updateTech(fd: FormData) {
  await requireRole("OWNER");
  const id = Number(fd.get("id")), email = str(fd.get("email")).toLowerCase(), name = str(fd.get("name"));
  if (!name || !EMAIL.test(email)) return;
  if (db().prepare("SELECT 1 FROM users WHERE email=? AND id<>?").get(email, id)) return;
  db().prepare("UPDATE users SET name=?,email=?,phone=? WHERE id=? AND role='TECH'").run(name, email, str(fd.get("phone"), 30), id);
  revalidatePath("/owner/technicians");
}

export async function toggleTech(fd: FormData) {
  await requireRole("OWNER");
  // Deactivate, never delete: jobs and materials reference the technician.
  db().prepare("UPDATE users SET active=1-active,token_version=token_version+1 WHERE id=? AND role='TECH'").run(Number(fd.get("id")));
  revalidatePath("/owner/technicians");
}

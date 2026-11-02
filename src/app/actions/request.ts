"use server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { limited } from "@/lib/auth";
import { notifyOwner } from "@/lib/notify";
import { PROPERTY_TYPES, REQUEST_KINDS, SERVICE_NAMES } from "@/lib/content";

export type FormState = { ok: boolean; error?: string; name?: string };
const clip = (v: FormDataEntryValue | null, n: number) => String(v ?? "").trim().slice(0, n);
const pick = (v: string, allowed: string[], d: string) => (allowed.includes(v) ? v : d);

export async function submitRequest(_prev: FormState, fd: FormData): Promise<FormState> {
  if (clip(fd.get("website"), 50)) return { ok: true }; // honeypot: silently accept
  const h = await headers();
  const ip = (h.get("x-forwarded-for") || "local").split(",")[0].trim();
  if (limited("req:" + ip, 5, 60 * 60 * 1000)) return { ok: false, error: "Too many requests. Please call 062 375 0851." };

  const phone = clip(fd.get("phone"), 30);
  if (phone.replace(/\D/g, "").length < 9) return { ok: false, error: "Please enter a valid phone number." };
  if (fd.get("consent") !== "on") return { ok: false, error: "Please tick the consent box so we can contact you." };
  const name = clip(fd.get("name"), 100) || "Call-back request";

  const r = {
    name, phone, email: clip(fd.get("email"), 120),
    type: pick(clip(fd.get("type"), 30), PROPERTY_TYPES, "Residential"),
    service: pick(clip(fd.get("service"), 60), SERVICE_NAMES, "Other"),
    kind: pick(clip(fd.get("kind"), 30), REQUEST_KINDS, "New installation"),
    address: clip(fd.get("address"), 200), description: clip(fd.get("description"), 2000),
    urgent: fd.get("urgent") === "on" ? 1 : 0,
  };
  db().prepare(
    "INSERT INTO requests(name,phone,email,property_type,service,kind,address,description,urgent) VALUES(?,?,?,?,?,?,?,?,?)"
  ).run(r.name, r.phone, r.email, r.type, r.service, r.kind, r.address, r.description, r.urgent);

  void notifyOwner(
    `${r.urgent ? "URGENT " : ""}New request: ${r.service} (${r.name})`,
    `${r.name}\n${r.phone} ${r.email}\n${r.type} · ${r.service} · ${r.kind}\n${r.address}\n\n${r.description}`
  );
  return { ok: true, name };
}

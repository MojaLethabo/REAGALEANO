"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { saveDraft, type QuotePayload } from "@/lib/quote";
import { QUOTE_CODE } from "@/lib/content";
import { SETTING_KEYS, company } from "@/lib/company";

const num = (v: FormDataEntryValue | null, d = 0) => (v !== null && v !== "" && Number.isFinite(Number(v)) ? Number(v) : d);
const str = (v: FormDataEntryValue | null, max = 300) => String(v ?? "").trim().slice(0, max);
const owner = () => requireRole("OWNER");
const STATUSES = ["New", "Contacted", "Assessment booked", "Quoted", "Converted", "Declined"];


// Generated server-side so numbers are unique and never reused: RGL-<TYPE>-<DDMMYY>, then -02, -03 on same-day collisions.
function nextQuoteNumber(service: string) {
  const d = new Date();
  const ds = String(d.getDate()).padStart(2, "0") + String(d.getMonth() + 1).padStart(2, "0") + String(d.getFullYear()).slice(-2);
  const base = `RGL-${QUOTE_CODE[service] ?? "GEN"}-${ds}`;
  let no = base, n = 1;
  while (db().prepare("SELECT 1 FROM quotes WHERE no=?").get(no)) { n++; no = `${base}-${String(n).padStart(2, "0")}`; }
  return no;
}

/* ---------- requests ---------- */
export async function setRequestStatus(fd: FormData) {
  await owner();
  const s = str(fd.get("status"));
  if (!STATUSES.includes(s)) return;
  db().prepare("UPDATE requests SET status=? WHERE id=?").run(s, num(fd.get("id")));
  revalidatePath("/owner/requests");
  revalidatePath("/owner");
}

type Req = { id: number; name: string; phone: string; email: string; address: string; service: string; kind: string };

export async function createQuote(fd: FormData) {
  await owner();
  const r = db().prepare("SELECT id,name,phone,email,address,service,kind FROM requests WHERE id=?").get(num(fd.get("id"))) as Req | undefined;
  if (!r) return;
  const validDays = Math.min(90, Math.max(1, Number(company().validDays) || 14));
  const id = db().transaction(() => {
    const no = nextQuoteNumber(r.service);
    const res = db().prepare("INSERT INTO quotes(no,request_id,client,site,project,valid_days,client_phone,client_email) VALUES(?,?,?,?,?,?,?,?)").run(no, r.id, r.name, r.address, `${r.service} – ${r.kind}`, validDays, r.phone, r.email);
    db().prepare("UPDATE requests SET status='Quoted' WHERE id=? AND status IN ('New','Contacted','Assessment booked')").run(r.id);
    return Number(res.lastInsertRowid);
  })();
  redirect(`/owner/quotes/${id}`);
}

/* ---------- price list ---------- */
export async function savePriceItem(fd: FormData) {
  await owner();
  const id = num(fd.get("id"));
  const name = str(fd.get("name"), 120), cat = str(fd.get("category"), 40);
  if (!name || !cat) return;
  const v = [name, cat, str(fd.get("unit"), 20) || "each", Math.max(0, num(fd.get("cost"))), Math.max(0, num(fd.get("markup"), 40)), fd.get("active") === "on" ? 1 : 0];
  if (id) db().prepare("UPDATE price_items SET name=?,category=?,unit=?,cost=?,markup=?,active=? WHERE id=?").run(...v, id);
  else db().prepare("INSERT INTO price_items(name,category,unit,cost,markup,active) VALUES(?,?,?,?,?,?)").run(...v);
  revalidatePath("/owner/prices");
}

/* ---------- quotes ---------- */
const touch = (id: number) => revalidatePath(`/owner/quotes/${id}`);
// The editor autosaves through saveQuoteDraft; there are no per-line save buttons.
export async function saveQuoteDraft(id: number, p: QuotePayload) {
  await owner();
  return saveDraft(Number(id), p);
}

export async function issueQuoteNow(id: number): Promise<{ ok: boolean; error?: string }> {
  await owner();
  const q = db().prepare("SELECT status FROM quotes WHERE id=?").get(Number(id)) as { status: string } | undefined;
  if (!q || q.status !== "Draft") return { ok: false, error: "This quote is already issued." };
  const n = db().prepare("SELECT COUNT(*) c FROM quote_lines WHERE quote_id=?").get(Number(id)) as { c: number };
  if (!n.c) return { ok: false, error: "Add at least one item before issuing." };
  db().prepare("UPDATE quotes SET status='Issued',issued_at=datetime('now') WHERE id=?").run(Number(id));
  revalidatePath("/owner/quotes");
  return { ok: true };
}

export async function createBlankQuote(fd: FormData) {
  await owner();
  const client = str(fd.get("client"), 120);
  if (!client) return;
  const service = str(fd.get("service"), 60);
  const validDays = Math.min(90, Math.max(1, Number(str(fd.get("valid"), 3)) || Number(company().validDays) || 14));
  const id = db().transaction(() => {
    const no = nextQuoteNumber(service);
    return Number(db().prepare("INSERT INTO quotes(no,client,site,project,valid_days,client_phone,client_email) VALUES(?,?,?,?,?,?,?)")
      .run(no, client, str(fd.get("site"), 200), service && service !== "Other" ? service : "", validDays, str(fd.get("phone"), 30), str(fd.get("email"), 120)).lastInsertRowid);
  })();
  redirect(`/owner/quotes/${id}`);
}

export async function deleteDraftQuote(fd: FormData) {
  await owner();
  db().prepare("DELETE FROM quotes WHERE id=? AND status='Draft'").run(num(fd.get("id")));
  revalidatePath("/owner/quotes");
}

export async function declineQuote(fd: FormData) {
  await owner();
  const id = num(fd.get("id"));
  db().prepare("UPDATE quotes SET status='Declined' WHERE id=? AND status='Issued'").run(id);
  touch(id);
  revalidatePath("/owner/quotes");
}

type Q = { id: number; client: string; site: string; project: string; scope: string; supplied: string; client_phone: string; client_email: string; request_id: number | null };

export async function acceptQuote(fd: FormData) {
  await owner();
  const id = num(fd.get("id"));
  const q = db().prepare("SELECT id,client,site,project,scope,supplied,client_phone,client_email,request_id FROM quotes WHERE id=? AND status='Issued'").get(id) as Q | undefined;
  if (!q) return;
  db().transaction(() => {
    db().prepare("UPDATE quotes SET status='Accepted',accepted_at=datetime('now') WHERE id=?").run(id);
    const job = Number(db().prepare("INSERT INTO jobs(quote_id,client,address,scope,client_phone,client_email) VALUES(?,?,?,?,?,?)")
      .run(id, q.client, q.site, [q.project, q.scope, q.supplied ? `Client supplies: ${q.supplied}` : ""].filter(Boolean).join("\n"), q.client_phone, q.client_email).lastInsertRowid);
    // Technicians get material names and quantities only. Prices are not copied.
    db().prepare("INSERT INTO job_materials(job_id,name,unit,planned) SELECT ?,name,unit,qty FROM quote_lines WHERE quote_id=? AND kind='M'").run(job, id);
    if (q.request_id) db().prepare("UPDATE requests SET status='Converted' WHERE id=?").run(q.request_id);
  })();
  redirect("/owner/jobs");
}

/* ---------- jobs ---------- */
export async function assignJob(fd: FormData) {
  await owner();
  const t = num(fd.get("tech"));
  if (t && !db().prepare("SELECT 1 FROM users WHERE id=? AND role='TECH' AND active=1").get(t)) return;
  db().prepare("UPDATE jobs SET assigned_at=CASE WHEN ? IS NULL THEN NULL WHEN tech_id IS ? THEN assigned_at ELSE datetime('now') END, tech_id=? WHERE id=?").run(t || null, t || null, t || null, num(fd.get("job")));
  revalidatePath("/owner/jobs");
}

/* ---------- settings (letterhead, branding, banking, terms) ---------- */
export async function saveSettings(fd: FormData) {
  await owner();
  const v: Record<string, string> = {};
  for (const k of SETTING_KEYS) if (fd.has(k)) v[k] = str(fd.get(k), k === "terms" ? 2000 : 200).replace(/\r/g, "");
  if (v.brand !== undefined && !/^#[0-9a-fA-F]{6}$/.test(v.brand)) v.brand = "#12355b";
  if (v.bankAccountNumber !== undefined) v.bankAccountNumber = v.bankAccountNumber.replace(/\D/g, "");
  if (v.validDays !== undefined) v.validDays = String(Math.min(90, Math.max(1, Number(v.validDays) || 14)));
  const up = db().prepare("INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  db().transaction(() => { for (const [k, val] of Object.entries(v)) up.run(k, val); })();
  revalidatePath("/owner/settings");
}

export async function updateJobContact(fd: FormData) {
  await owner();
  db().prepare("UPDATE jobs SET address=?,client_phone=?,client_email=? WHERE id=?")
    .run(str(fd.get("address"), 200), str(fd.get("phone"), 30), str(fd.get("email"), 120), num(fd.get("job")));
  revalidatePath("/owner/jobs");
}

// Only the owner can reopen a job, so completion times stay honest.
export async function reopenJob(fd: FormData) {
  await owner();
  db().prepare("UPDATE jobs SET status='Open',completed_at=NULL WHERE id=?").run(num(fd.get("job")));
  revalidatePath("/owner/jobs");
  revalidatePath("/tech");
}

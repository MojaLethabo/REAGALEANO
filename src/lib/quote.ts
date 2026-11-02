export function derivedStatus(q: { status: string; issued_at: string | null; valid_days: number }) {
  if (q.status === "Issued" && q.issued_at) {
    const exp = new Date(q.issued_at.replace(" ", "T") + "Z").getTime() + q.valid_days * 864e5;
    if (Date.now() > exp) return "Expired";
  }
  return q.status;
}

import { db } from "./db";

export type PayloadLine = { kind: "M" | "L"; name: string; unit: string; qty: number; price: number; cost: number; nc: boolean; itemId?: number | null };
export type QuotePayload = { clientPhone?: string; clientEmail?: string; project: string; site: string; scope: string; supplied: string; disc: number; vat: boolean; valid: number; lines: PayloadLine[] };

const clamp = (v: unknown, min: number, max: number, d: number) => { const x = Number(v); return Number.isFinite(x) ? Math.min(max, Math.max(min, x)) : d; };
const clip = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

// Replaces the draft's details and lines in one transaction. Used by the editor's autosave.
export function saveDraft(id: number, p: QuotePayload): { ok: boolean; error?: string } {
  const q = db().prepare("SELECT status FROM quotes WHERE id=?").get(id) as { status: string } | undefined;
  if (!q) return { ok: false, error: "Quote not found." };
  if (q.status !== "Draft") return { ok: false, error: "This quote is locked." };
  const raw = Array.isArray(p.lines) ? p.lines.slice(0, 200) : [];
  const lines = raw.map((l) => {
    const labour = l.kind === "L";
    return { kind: labour ? "L" : "M", name: clip(l.name, 200), unit: clip(l.unit, 20) || (labour ? "task" : "each"),
      qty: labour ? 1 : clamp(l.qty, 0.01, 1e6, 1), price: clamp(l.price, 0, 1e8, 0), cost: clamp(l.cost, 0, 1e8, 0), nc: !!l.nc, itemId: Number(l.itemId) || null };
  }).filter((l) => l.name);
  const item = db().prepare("SELECT cost FROM price_items WHERE id=?");
  db().transaction(() => {
    db().prepare("UPDATE quotes SET client_phone=COALESCE(?,client_phone),client_email=COALESCE(?,client_email),project=?,site=?,scope=?,supplied=?,disc=?,vat=?,valid_days=? WHERE id=?").run(
      p.clientPhone === undefined ? null : clip(p.clientPhone, 30), p.clientEmail === undefined ? null : clip(p.clientEmail, 120), clip(p.project, 200), clip(p.site, 200), clip(p.scope, 2000), clip(p.supplied, 2000), clamp(p.disc, 0, 100, 0), p.vat ? 1 : 0, Math.round(clamp(p.valid, 1, 90, 14)), id);
    db().prepare("DELETE FROM quote_lines WHERE quote_id=?").run(id);
    const ins = db().prepare("INSERT INTO quote_lines(quote_id,kind,name,unit,qty,price,cost,nc) VALUES(?,?,?,?,?,?,?,?)");
    for (const l of lines) {
      let cost = l.cost, nc = l.nc ? 1 : 0;
      if (l.itemId && l.kind === "M") { // trust the price list for cost, not the browser
        const it = item.get(l.itemId) as { cost: number } | undefined;
        if (it) { cost = it.cost; nc = 0; }
      }
      ins.run(id, l.kind, l.name, l.unit, l.qty, l.price, l.kind === "L" ? 0 : cost, l.kind === "L" ? 1 : nc);
    }
  })();
  return { ok: true };
}

"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QuoteDoc, { type DocLine, type DocQuote } from "@/components/QuoteDoc";
import Stepper from "@/components/Stepper";
import type { Settings } from "@/lib/company";
import { R, calc, sell } from "@/lib/money";
import type { QuotePayload } from "@/lib/quote";
import { acceptQuote, declineQuote, issueQuoteNow, saveQuoteDraft } from "../../actions";

export type EditorItem = { id: number; name: string; unit: string; category: string; cost: number; markup: number };
export type EditorQuote = DocQuote & { id: number };
type L = { key: number; kind: "M" | "L"; name: string; unit: string; qty: string; price: string; cost: number; nc: boolean; itemId: number | null };
type SaveState = "saved" | "dirty" | "saving" | "error";

const num = (v: string) => { const x = parseFloat(v); return Number.isFinite(x) ? x : 0; };
const day = (s: string, plus = 0) => new Date(new Date(s.replace(" ", "T") + "Z").getTime() + plus * 864e5).toISOString().slice(0, 10);
const Trash = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>
);

export default function QuoteEditor({ quote, lines: init, items, co, expired }: { quote: EditorQuote; lines: DocLine[]; items: EditorItem[]; co: Settings; expired: boolean }) {
  const router = useRouter();
  const draft = quote.status === "Draft";
  const nextKey = useRef(init.length + 1);
  const [meta, setMeta] = useState({ clientPhone: quote.client_phone ?? "", clientEmail: quote.client_email ?? "", project: quote.project, site: quote.site, scope: quote.scope, supplied: quote.supplied, disc: String(quote.disc), vat: !!quote.vat, valid: String(quote.valid_days) });
  const [lines, setLines] = useState<L[]>(init.map((l, i) => ({ key: i + 1, kind: l.kind, name: l.name, unit: l.unit, qty: String(l.qty), price: String(l.price), cost: l.cost, nc: !!l.nc, itemId: null })));
  const [state, setState] = useState<SaveState>("saved");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Everything below is computed on every keystroke, so totals update instantly.
  const parsed = useMemo(() => lines.filter((l) => l.name.trim()).map((l, i) => ({
    id: i, kind: l.kind, name: l.name.trim(), unit: l.unit || (l.kind === "L" ? "task" : "each"),
    qty: l.kind === "L" ? 1 : num(l.qty), price: num(l.price), cost: l.cost, nc: l.nc ? 1 : 0,
  })), [lines]);
  const c = calc(parsed, num(meta.disc), meta.vat);
  const validDays = Math.round(num(meta.valid)) || 14;
  const docQuote: DocQuote = { ...quote, client_phone: meta.clientPhone, client_email: meta.clientEmail, project: meta.project, site: meta.site, scope: meta.scope, supplied: meta.supplied, disc: num(meta.disc), vat: meta.vat ? 1 : 0, valid_days: validDays };

  const payload = useMemo<QuotePayload>(() => ({
    ...meta, disc: num(meta.disc), valid: validDays,
    lines: lines.map((l) => ({ kind: l.kind, name: l.name, unit: l.unit, qty: num(l.qty) || 1, price: num(l.price), cost: l.cost, nc: l.nc, itemId: l.itemId })),
  }), [meta, lines, validDays]);
  const payloadRef = useRef(payload);
  payloadRef.current = payload;

  // Autosave: 700 ms after the last change. Out-of-order replies are ignored via seq.
  const seq = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const save = useCallback(async () => {
    const mine = ++seq.current;
    setState("saving");
    try {
      const r = await saveQuoteDraft(quote.id, payloadRef.current);
      if (mine !== seq.current) return;
      setState(r.ok ? "saved" : "error");
      setErr(r.ok ? "" : r.error ?? "Could not save.");
    } catch {
      if (mine === seq.current) { setState("error"); setErr("Could not reach the server."); }
    }
  }, [quote.id]);
  const first = useRef(true);
  useEffect(() => {
    if (!draft) return;
    if (first.current) { first.current = false; return; }
    setState("dirty");
    clearTimeout(timer.current);
    timer.current = setTimeout(save, 700);
  }, [payload, draft, save]);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (state === "dirty" || state === "saving") e.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [state]);
  const flush = async () => { clearTimeout(timer.current); if (state !== "saved") await save(); };

  const upd = (key: number, patch: Partial<L>) => setLines((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const add = (kind: "M" | "L") => setLines((ls) => [...ls, { key: nextKey.current++, kind, name: "", unit: kind === "L" ? "task" : "each", qty: "1", price: "", cost: 0, nc: true, itemId: null }]);
  const onName = (l: L, v: string) => {
    const it = items.find((i) => i.name.toLowerCase() === v.trim().toLowerCase() && (l.kind === "L") === (i.category === "Labour"));
    if (it) upd(l.key, { name: it.name, unit: l.kind === "L" ? "task" : it.unit, price: String(l.kind === "L" ? it.cost : sell(it.cost, it.markup)), cost: it.cost, itemId: it.id, nc: false });
    else upd(l.key, { name: v, itemId: null, nc: true });
  };

  const issue = async () => {
    setBusy(true); await flush();
    const r = await issueQuoteNow(quote.id);
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(r.error ?? "Could not issue.");
  };

  const rows = (kind: "M" | "L") => lines.filter((l) => l.kind === kind).map((l) => (
    <div className={"qrow" + (kind === "L" ? " lab" : "")} key={l.key}>
      <input list={kind === "L" ? "dl-l" : "dl-m"} value={l.name} onChange={(e) => onName(l, e.target.value)} disabled={!draft}
        placeholder={kind === "L" ? "Work description or pick ↓" : "Item description or pick ↓"} aria-label="Description" />
      {kind === "M" && <>
        <input className="n" type="number" min="0" step="any" value={l.qty} onChange={(e) => upd(l.key, { qty: e.target.value })} disabled={!draft} aria-label="Quantity" />
        <input value={l.unit} onChange={(e) => upd(l.key, { unit: e.target.value })} disabled={!draft} placeholder="Unit" aria-label="Unit" />
      </>}
      <input className="n" type="number" min="0" step="0.01" value={l.price} onChange={(e) => upd(l.key, { price: e.target.value })} disabled={!draft} placeholder="0.00" aria-label={kind === "L" ? "Amount" : "Unit price"} />
      <b className="lt">{R((kind === "L" ? 1 : num(l.qty)) * num(l.price))}</b>
      {draft ? <button type="button" className="ibtn" onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} aria-label="Remove line"><Trash /></button> : <span />}
    </div>
  ));

  const label = { saved: "✓ All changes saved", dirty: "Unsaved changes…", saving: "Saving…", error: err || "Could not save" }[state];
  const validUntil = day(quote.issued_at ?? quote.created_at, validDays);

  return (
    <>
      <div className="inline between"><h1 className="h1s">{quote.no} · {quote.client}</h1><Stepper status={quote.status} expired={expired} /></div>
      <datalist id="dl-m">{items.filter((i) => i.category !== "Labour").map((i) => <option key={i.id} value={i.name} />)}</datalist>
      <datalist id="dl-l">{items.filter((i) => i.category === "Labour").map((i) => <option key={i.id} value={i.name} />)}</datalist>

      <div className="qb">
        <div className="qbl">
          <div className="qcard"><div style={{ padding: 18 }}>
            <div className="g3">
              <div><label className="cap">Customer</label><input value={quote.client} disabled /></div>
              <div><label className="cap">Date</label><input value={day(quote.issued_at ?? quote.created_at)} disabled /></div>
              <div><label className="cap" htmlFor="valid">Valid for (days) → until {validUntil}</label><input id="valid" type="number" min="1" max="90" value={meta.valid} onChange={(e) => setMeta({ ...meta, valid: e.target.value })} disabled={!draft} /></div>
            </div>
            <div className="g2">
              <div><label className="cap" htmlFor="cphone">Customer phone</label><input id="cphone" type="tel" value={meta.clientPhone} onChange={(e) => setMeta({ ...meta, clientPhone: e.target.value })} disabled={!draft} placeholder="Technicians use this to call the client" /></div>
              <div><label className="cap" htmlFor="cemail">Customer email (optional)</label><input id="cemail" type="email" value={meta.clientEmail} onChange={(e) => setMeta({ ...meta, clientEmail: e.target.value })} disabled={!draft} /></div>
            </div>
            <div className="g2">
              <div><label className="cap" htmlFor="project">Project title</label><input id="project" value={meta.project} onChange={(e) => setMeta({ ...meta, project: e.target.value })} disabled={!draft} /></div>
              <div><label className="cap" htmlFor="site">Site address</label><input id="site" value={meta.site} onChange={(e) => setMeta({ ...meta, site: e.target.value })} disabled={!draft} /></div>
            </div>
          </div></div>

          <div className="qcard"><div style={{ padding: 18 }}>
            <label className="cap">Materials and equipment</label>
            <div className="qrow qhd"><span>ITEM</span><span>QTY</span><span>UNIT</span><span>PRICE</span><span>TOTAL</span><span /></div>
            {rows("M")}
            {draft && <button type="button" className="btn sm alt" onClick={() => add("M")}>+ Add item</button>}
            <label className="cap" style={{ marginTop: 22 }}>Professional labour</label>
            <div className="qrow lab qhd"><span>WORK DESCRIPTION</span><span>AMOUNT</span><span>TOTAL</span><span /></div>
            {rows("L")}
            {draft && <button type="button" className="btn sm alt" onClick={() => add("L")}>+ Add task</button>}
          </div></div>

          <div className="qcard"><div style={{ padding: 18 }}>
            <div className="g2">
              <div><label className="cap" htmlFor="scope">Included scope (optional)</label><textarea id="scope" value={meta.scope} onChange={(e) => setMeta({ ...meta, scope: e.target.value })} disabled={!draft} placeholder="What the price includes…" /></div>
              <div><label className="cap" htmlFor="supplied">Client-supplied equipment (optional)</label><textarea id="supplied" value={meta.supplied} onChange={(e) => setMeta({ ...meta, supplied: e.target.value })} disabled={!draft} placeholder="Items the client provides…" /></div>
            </div>
          </div></div>
        </div>

        <aside className="qbr">
          <div className="qcard"><div style={{ padding: 18 }}>
            <div className={"savestate " + state} role="status" aria-live="polite">{draft ? label : "Locked"}{state === "error" && draft && <button type="button" className="lnk" onClick={save}> Retry</button>}</div>
            <div className="tot" style={{ margin: "10px 0" }}>
              <div><span>Materials</span><span>{R(c.m)}</span></div><div><span>Labour</span><span>{R(c.l)}</span></div>
              <div><span>Discount %</span><span><input className="mini" type="number" min="0" max="100" step="0.1" value={meta.disc} onChange={(e) => setMeta({ ...meta, disc: e.target.value })} disabled={!draft} aria-label="Discount percent" /></span></div>
              {c.d > 0 && <div><span>Discount</span><span>−{R(c.d)}</span></div>}
              <div><label className="chk" style={{ margin: 0 }}><input type="checkbox" checked={meta.vat} onChange={(e) => setMeta({ ...meta, vat: e.target.checked })} disabled={!draft} /> Add VAT 15%</label><span>{meta.vat ? R(c.vat) : ""}</span></div>
            </div>
            <div className="totbox"><span>TOTAL</span><b>{R(c.total)}</b></div>
            <div className={"note" + (c.margin < 20 ? " w" : "")}>Margin on costed materials: <b>{c.margin.toFixed(1)}%</b><br /><small>Owner only. Custom items and labour excluded.</small></div>
            <a className="btn w" href={`/print/quotes/${quote.id}`} target="_blank" rel="noreferrer"
              onClick={async (e) => { if (draft && state !== "saved") { e.preventDefault(); await flush(); window.open(`/print/quotes/${quote.id}`, "_blank"); } }}>
              {draft ? "Preview PDF (draft)" : "Download PDF"}</a>
            <div className="stack">
              {draft && <button className="btn w alt" onClick={issue} disabled={busy || !parsed.length}>Issue quote (locks it)</button>}
              {quote.status === "Issued" && <>
                <form action={acceptQuote}><input type="hidden" name="id" value={quote.id} /><button className="btn w alt">Mark accepted and create job</button></form>
                <form action={declineQuote}><input type="hidden" name="id" value={quote.id} /><button className="btn w alt">Mark declined</button></form></>}
            </div>
            {err && state !== "error" && <div className="note w" role="alert">{err}</div>}
            {!draft && <p className="muted"><small>Issued quotes are locked so you and the client always see the same figures.</small></p>}
          </div></div>
          <div className="qcard"><div style={{ padding: 18 }}><label className="cap">Live preview</label>
            <div className="preview"><QuoteDoc q={docQuote} lines={parsed} co={co} /></div></div></div>
        </aside>
      </div>
    </>
  );
}

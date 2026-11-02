import type { CSSProperties } from "react";
import { R, calc, fmtDate, type Line } from "@/lib/money";
import type { Settings } from "@/lib/company";

export type DocQuote = { client_phone?: string; client_email?: string; no: string; client: string; site: string; project: string; scope: string; supplied: string; vat: number; disc: number; valid_days: number; status: string; created_at: string; issued_at: string | null };
export type DocLine = Line & { id: number; name: string; unit: string };

export default function QuoteDoc({ q, lines, co }: { q: DocQuote; lines: DocLine[]; co: Settings }) {
  const c = calc(lines, q.disc, !!q.vat);
  const date = new Date((q.issued_at ?? q.created_at).replace(" ", "T") + "Z");
  const until = new Date(date.getTime() + q.valid_days * 864e5);
  const mats = lines.filter((l) => l.kind === "M"), lab = lines.filter((l) => l.kind === "L");
  const terms = co.terms.split("\n").map((t) => t.trim()).filter(Boolean);
  return (
    <div className="doc" style={{ "--brand": co.brand } as CSSProperties}>
      {q.status === "Draft" && <div className="wm">DRAFT</div>}
      <div className="dhead"><div className="dbig">{co.trading}</div><div className="dtag">{co.tagline}</div></div>
      <div className="drow">
        <div><b>{co.legal}</b><br />Reg. No. {co.reg}<br />{co.address}<br />{co.phone} | {co.email}<br />{co.website}</div>
        <div style={{ textAlign: "right" }}><div className="dtitle">QUOTATION</div>Quote No: <b>{q.no}</b><br />Date: {fmtDate(date)}<br />Valid until: {fmtDate(until)}</div>
      </div>
      <div className="drow" style={{ marginTop: 14 }}><div><b>PREPARED FOR</b><br />{q.client}<br />{q.site}{q.client_phone ? <><br />{q.client_phone}</> : null}</div><div><b>PROJECT</b><br />{q.project}</div></div>

      <h3 className="dh">MATERIALS &amp; EQUIPMENT</h3>
      <table className="dt"><thead><tr><th>No.</th><th>Description</th><th>Qty</th><th className="r">Unit price</th><th className="r">Amount</th></tr></thead>
        <tbody>{mats.map((l, i) => <tr key={l.id}><td>{i + 1}</td><td>{l.name}</td><td>{l.qty}{l.unit === "each" ? "" : " " + l.unit}</td><td className="r">{R(l.price)}</td><td className="r">{R(l.qty * l.price)}</td></tr>)}</tbody></table>
      <div className="r"><b>Materials total {R(c.m)}</b></div>

      <h3 className="dh">PROFESSIONAL LABOUR</h3>
      <table className="dt"><thead><tr><th>No.</th><th>Work description</th><th className="r">Amount</th></tr></thead>
        <tbody>{lab.map((l, i) => <tr key={l.id}><td>{i + 1}</td><td>{l.name}</td><td className="r">{R(l.price)}</td></tr>)}</tbody></table>
      <div className="r"><b>Professional labour total {R(c.l)}</b></div>

      <div className="tot" style={{ marginLeft: "auto" }}>
        {q.disc > 0 && <div><span>Discount ({q.disc}%)</span><span>−{R(c.d)}</span></div>}
        {q.vat ? <div><span>VAT 15%</span><span>{R(c.vat)}</span></div> : null}
        <div className="big"><span>TOTAL QUOTATION</span><span>{R(c.total)}</span></div>
      </div>

      {q.supplied && <><h3 className="dh">CLIENT-SUPPLIED EQUIPMENT</h3><p>{q.supplied}</p></>}
      {q.scope && <><h3 className="dh">INCLUDED SCOPE</h3><p>{q.scope}</p></>}
      <h3 className="dh">TERMS AND CONDITIONS</h3>
      <ol className="dterms"><li>Quotation valid for {q.valid_days} days.</li>{terms.map((t) => <li key={t}>{t}</li>)}</ol>
      {co.bankAccountNumber && <><h3 className="dh">BANKING DETAILS</h3>
        <p>Account name: {co.bankAccountName}<br />Bank: {co.bankName}<br />Account number: {co.bankAccountNumber}<br />Account type: {co.bankAccountType}<br />Reference: Initial &amp; Surname</p></>}
      <h3 className="dh">CUSTOMER ACCEPTANCE</h3>
      <p style={{ marginTop: 18 }}>Name: ______________________ &nbsp; Signature: ______________________ &nbsp; Date: ____________</p>
      <p className="dthanks">Thank you for choosing Reagaleano. Safe • Reliable • Professional.</p>
    </div>
  );
}

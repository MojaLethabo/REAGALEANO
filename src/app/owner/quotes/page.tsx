import Link from "next/link";
import { db } from "@/lib/db";
import { R, calc, type Line } from "@/lib/money";
import { derivedStatus } from "@/lib/quote";
import ConfirmButton from "@/components/ConfirmButton";
import { deleteDraftQuote } from "../actions";

type Q = { id: number; no: string; client: string; scope: string; status: string; disc: number; vat: number; valid_days: number; created_at: string; issued_at: string | null };
type L = Line & { quote_id: number; name: string; unit: string };
const day = (s: string, plus = 0) => new Date(new Date(s.replace(" ", "T") + "Z").getTime() + plus * 864e5).toISOString().slice(0, 10);

export default function Quotes() {
  const quotes = db().prepare("SELECT id,no,client,scope,status,disc,vat,valid_days,created_at,issued_at FROM quotes ORDER BY id DESC").all() as Q[];
  const lines = db().prepare("SELECT quote_id,kind,name,unit,qty,price,cost,nc FROM quote_lines ORDER BY id").all() as L[];
  return (
    <>
      <div className="inline between" style={{ marginBottom: 14 }}>
        <div><h1 className="h1s">Quotations</h1><p className="muted" style={{ margin: 0 }}>{quotes.length} quotation{quotes.length === 1 ? "" : "s"}</p></div>
        <Link className="btn" href="/owner/quotes/new">+ New Quotation</Link>
      </div>
      {!quotes.length && <div className="qcard"><div className="qchead">No quotations yet. Create one, or start from a request on the Requests page.</div></div>}
      {quotes.map((q) => {
        const ls = lines.filter((l) => l.quote_id === q.id), c = calc(ls, q.disc, !!q.vat), st = derivedStatus(q);
        const shown = ls.slice(0, 6);
        return (
          <div className="qcard" key={q.id}>
            <div className="qchead">
              <div>
                <b>{q.client}</b> <span className={"badge " + (st === "Accepted" ? "g" : st === "Declined" || st === "Expired" ? "u" : "")}>{st.toUpperCase()}</span>
                <div className="muted"><small>{q.no} · {day(q.created_at)} → {day(q.issued_at ?? q.created_at, q.valid_days)}</small></div>
              </div>
              <div className="qcact">
                <b className="qtot">{R(c.total)}</b>
                <Link className="btn sm alt" href={`/owner/quotes/${q.id}`}>{q.status === "Draft" ? "Edit" : "Open"}</Link>
                <Link className="btn sm alt print" href={`/print/quotes/${q.id}`} target="_blank">Print</Link>
                {q.status === "Draft" && <form action={deleteDraftQuote}><input type="hidden" name="id" value={q.id} /><ConfirmButton className="btn sm alt del" message="Delete this draft quotation?">Delete</ConfirmButton></form>}
              </div>
            </div>
            <table className="t qt">
              <thead><tr><th>ITEM</th><th className="r">QTY</th><th className="r">UNIT</th><th className="r">SUBTOTAL</th></tr></thead>
              <tbody>
                {shown.map((l, i) => (
                  <tr key={i}><td>{l.name}</td><td className="r">{l.kind === "L" ? "" : l.qty}</td><td className="r">{R(l.price)}</td><td className="r"><b>{R(l.qty * l.price)}</b></td></tr>
                ))}
                {ls.length > shown.length && <tr><td colSpan={4} className="muted">+ {ls.length - shown.length} more items</td></tr>}
                {!ls.length && <tr><td colSpan={4} className="muted">No items yet.</td></tr>}
              </tbody>
            </table>
            {q.scope && <div className="qfoot">{q.scope}</div>}
          </div>
        );
      })}
    </>
  );
}

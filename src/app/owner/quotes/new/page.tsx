import Link from "next/link";
import { db } from "@/lib/db";
import { company } from "@/lib/company";
import { SERVICE_NAMES } from "@/lib/content";
import { createBlankQuote } from "../../actions";

export default function NewQuote() {
  const names = (db().prepare("SELECT name FROM requests UNION SELECT client FROM quotes ORDER BY 1").all() as { name: string }[]).map((r) => r.name);
  return (
    <>
      <p><Link href="/owner/quotes">← Quotations</Link></p>
      <form action={createBlankQuote} className="qcard" style={{ maxWidth: 720 }}>
        <div className="qchead"><b>New Quotation</b></div>
        <div style={{ padding: "0 18px 18px" }}>
          <label className="cap" htmlFor="client">Customer *</label>
          <input id="client" name="client" list="clients" required placeholder="Select or type a customer…" autoComplete="off" />
          <datalist id="clients">{names.map((n) => <option key={n} value={n} />)}</datalist>
          <div className="g2">
            <div><label className="cap" htmlFor="phone">Customer phone *</label><input id="phone" name="phone" type="tel" required /></div>
            <div><label className="cap" htmlFor="email">Customer email</label><input id="email" name="email" type="email" /></div>
          </div>
          <div className="g3">
            <div><label className="cap" htmlFor="site">Site address</label><input id="site" name="site" /></div>
            <div><label className="cap" htmlFor="service">Type of work</label><select id="service" name="service">{SERVICE_NAMES.map((n) => <option key={n}>{n}</option>)}</select></div>
            <div><label className="cap" htmlFor="valid">Valid for (days)</label><input id="valid" name="valid" type="number" min={1} max={90} defaultValue={company().validDays} /></div>
          </div>
          <p className="muted"><small>The type of work sets the quote number prefix, for example RGL-CCTV-…</small></p>
          <div className="inline" style={{ justifyContent: "flex-end" }}>
            <Link className="btn alt" href="/owner/quotes">Cancel</Link><button className="btn">Create and add items</button>
          </div>
        </div>
      </form>
    </>
  );
}

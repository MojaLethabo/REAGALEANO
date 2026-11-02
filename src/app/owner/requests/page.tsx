import { db } from "@/lib/db";
import AutoForm from "@/components/AutoForm";
import { createQuote, setRequestStatus } from "../actions";

const STATUSES = ["New", "Contacted", "Assessment booked", "Quoted", "Converted", "Declined"];
type R = { id: number; name: string; phone: string; email: string; property_type: string; service: string; kind: string; address: string; description: string; urgent: number; status: string; created_at: string };

export default function Requests() {
  const rows = db().prepare("SELECT * FROM requests ORDER BY id DESC").all() as R[];
  return (
    <>
      <h1 className="h1s">Requests</h1>
      <p className="muted">Requests from the website. Create a quote straight from a request.</p>
      <div className="card scroll"><table className="t">
        <thead><tr><th>Received</th><th>Client</th><th>Request</th><th>Status</th><th></th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.created_at.slice(0, 16)}</td>
              <td><b>{r.name}</b><br /><a href={`tel:${r.phone}`}>{r.phone}</a>{r.email && <><br />{r.email}</>}<br /><small className="muted">{r.property_type}</small></td>
              <td>{r.service} · {r.kind}{r.urgent ? <span className="badge u"> Urgent</span> : null}<br /><small className="muted">{r.address}</small><br /><small>{r.description}</small></td>
              <td><AutoForm action={setRequestStatus} className="inline" delay={100}><input type="hidden" name="id" value={r.id} />
                <select name="status" defaultValue={r.status} aria-label="Status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></AutoForm></td>
              <td><form action={createQuote}><input type="hidden" name="id" value={r.id} /><button className="btn sm">Create quote</button></form></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={5}>No requests yet.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}

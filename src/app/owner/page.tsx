import Link from "next/link";
import { db } from "@/lib/db";

export default function Dashboard() {
  const c = (sql: string) => (db().prepare(sql).get() as { c: number }).c;
  const stale = c("SELECT COUNT(*) c FROM quotes WHERE status='Issued' AND issued_at < datetime('now','-7 days')");
  const recent = db().prepare("SELECT id,name,service,kind,urgent,status,created_at FROM requests ORDER BY id DESC LIMIT 6").all() as
    { id: number; name: string; service: string; kind: string; urgent: number; status: string; created_at: string }[];
  const kpi: [string, number, string][] = [
    ["New requests", c("SELECT COUNT(*) c FROM requests WHERE status='New'"), "/owner/requests"],
    ["Quotes awaiting reply", c("SELECT COUNT(*) c FROM quotes WHERE status='Issued'"), "/owner/quotes"],
    ["Issued over 7 days ago", stale, "/owner/quotes"],
    ["Unassigned jobs", c("SELECT COUNT(*) c FROM jobs WHERE tech_id IS NULL AND status='Open'"), "/owner/jobs"],
    ["Open jobs", c("SELECT COUNT(*) c FROM jobs WHERE status='Open'"), "/owner/jobs"],
  ];
  return (
    <>
      <h1 className="h1s">Dashboard</h1>
      <div className="kpis">{kpi.map(([l, n, h]) => <Link key={l} href={h} className="kpi"><b>{n}</b><span>{l}</span></Link>)}</div>
      <h2 style={{ marginTop: 28 }}>Latest requests</h2>
      <div className="card scroll"><table className="t"><tbody>
        {recent.map((r) => (
          <tr key={r.id}><td>{r.created_at.slice(0, 16)}</td><td><b>{r.name}</b></td><td>{r.service} · {r.kind}{r.urgent ? <span className="badge u"> Urgent</span> : null}</td><td><span className="badge">{r.status}</span></td></tr>
        ))}
        {!recent.length && <tr><td>No requests yet.</td></tr>}
      </tbody></table></div>
    </>
  );
}

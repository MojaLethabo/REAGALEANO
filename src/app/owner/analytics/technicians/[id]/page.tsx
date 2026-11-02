import Link from "next/link";
import { notFound } from "next/navigation";
import { RangeTabs } from "@/components/Charts";
import { RANGES, fmtHours, pct, since, techJobs, techStats, validRange } from "@/lib/analytics";
import { db } from "@/lib/db";
import { R, fmtDate } from "@/lib/money";

export default async function TechAnalytics({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ range?: string }> }) {
  const { id } = await params;
  const range = validRange((await searchParams).range);
  const u = db().prepare("SELECT id FROM users WHERE id=? AND role='TECH'").get(Number(id));
  if (!u) notFound();
  const s = techStats(since(range), Number(id))[0];
  const jobs = techJobs(Number(id), since(range));
  const kpi: [string, string][] = [
    ["Assigned", String(s.assigned)], ["Completed", String(s.done)], ["Open", String(s.open)], ["Completion rate", pct(s.completion)],
    ["Avg time to complete", fmtHours(s.avgHours)], ["Completed value", R(s.value)],
  ];
  return (
    <>
      <p><Link href={`/owner/analytics?range=${range}`}>← Analytics</Link></p>
      <h1 className="h1s">{s.name} {!s.active && <span className="badge u">Inactive</span>}</h1>
      <RangeTabs base={`/owner/analytics/technicians/${id}`} range={range} ranges={RANGES} />
      <div className="kpis">{kpi.map(([l, v]) => <div key={l} className="kpi"><b>{v}</b><span>{l}</span></div>)}</div>
      <h2 style={{ marginTop: 26 }}>Jobs</h2>
      <div className="card scroll"><table className="t">
        <thead><tr><th>Job</th><th>Client</th><th>Status</th><th>Assigned</th><th className="r">Time to complete</th><th className="r">Value</th></tr></thead>
        <tbody>
          {jobs.map(({ job, hours, value }) => (
            <tr key={job.id}>
              <td>J-{String(job.id).padStart(3, "0")}</td><td>{job.client}</td>
              <td><span className={"badge " + (job.status === "Completed" ? "g" : "")}>{job.status}</span></td>
              <td>{fmtDate((job.assigned_at ?? job.created_at).replace(" ", "T") + "Z")}</td>
              <td className="r">{fmtHours(hours)}</td><td className="r">{R(value)}</td>
            </tr>
          ))}
          {!jobs.length && <tr><td colSpan={6}>No jobs in this period.</td></tr>}
        </tbody>
      </table></div>
    </>
  );
}

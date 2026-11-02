import Link from "next/link";
import { Bars, Columns, RangeTabs } from "@/components/Charts";
import { RANGES, fmtHours, overview, pct, since, techStats, validRange } from "@/lib/analytics";
import { R } from "@/lib/money";

const short = (n: number) => (n >= 1000 ? `R${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : `R${Math.round(n)}`);

export default async function Analytics({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const range = validRange((await searchParams).range);
  const o = overview(range), q = o.quotes, f = o.funnel;
  const techs = techStats(since(range));
  const kpi: [string, string, string?][] = [
    ["Requests", String(o.requests.total), o.requests.urgent ? `${o.requests.urgent} urgent` : undefined],
    ["Quotes issued", String(q.issued), `${q.created} created`],
    ["Win rate", pct(q.winRate), `${q.accepted} accepted · ${q.declined} declined · ${q.expired} expired`],
    ["Accepted value", R(q.acceptedValue), `Avg quote ${q.avgValue === null ? "—" : R(q.avgValue)}`],
    ["Margin on materials", pct(q.margin), "Costed items only"],
    ["Time to quote", fmtHours(q.hoursToQuote), `To decision ${fmtHours(q.hoursToDecision)}`],
  ];
  return (
    <>
      <h1 className="h1s">Analytics</h1>
      <RangeTabs base="/owner/analytics" range={range} ranges={RANGES} />
      <div className="kpis">{kpi.map(([l, v, s]) => <div key={l} className="kpi"><b>{v}</b><span>{l}</span>{s && <small>{s}</small>}</div>)}</div>

      <div className="grid2">
        <div className="card"><h3>Requests per week</h3><Columns rows={o.requests.weekly} label="Requests per week, last 12 weeks" /></div>
        <div className="card"><h3>Accepted value per month</h3><Columns rows={q.monthly} fmt={short} label="Accepted quote value per month, last 6 months" /></div>
        <div className="card"><h3>From request to accepted quote</h3>
          <Bars rows={[["Requests", f.total], ["Quoted", f.quoted], ["Quote issued", f.issued], ["Accepted", f.accepted]]} />
          <p className="muted">{f.total ? `${((f.accepted / f.total) * 100).toFixed(0)}% of requests in this period became accepted quotes.` : "No requests in this period."}</p></div>
        <div className="card"><h3>Requests by service</h3><Bars rows={o.requests.byService as [string, number][]} /></div>
        <div className="card"><h3>Requests by property type</h3><Bars rows={o.requests.byType as [string, number][]} /></div>
      </div>

      <h2 style={{ marginTop: 26 }}>Technicians</h2>
      <div className="card scroll"><table className="t">
        <thead><tr><th>Technician</th><th className="r">Assigned</th><th className="r">Completed</th><th className="r">Open</th><th className="r">Completion</th><th className="r">Avg time to complete</th><th className="r">Completed value</th></tr></thead>
        <tbody>
          {techs.map((t) => (
            <tr key={t.id}>
              <td><Link className="lnk" href={`/owner/analytics/technicians/${t.id}?range=${range}`}>{t.name}</Link>{!t.active && <span className="badge u"> Inactive</span>}</td>
              <td className="r">{t.assigned}</td><td className="r">{t.done}</td><td className="r">{t.open}</td><td className="r">{pct(t.completion)}</td>
              <td className="r">{fmtHours(t.avgHours)}</td><td className="r">{R(t.value)}</td>
            </tr>
          ))}
          {!techs.length && <tr><td colSpan={7}>No technicians yet.</td></tr>}
        </tbody>
      </table></div>
      <p className="muted">Time to complete runs from when the job was assigned to when the technician marked it complete. Completed value is the quote total of those jobs.</p>
    </>
  );
}

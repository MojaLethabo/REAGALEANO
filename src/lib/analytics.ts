import { db } from "./db";

export const RANGES: [string, string][] = [["30", "Last 30 days"], ["90", "Last 90 days"], ["365", "Last 12 months"], ["all", "All time"]];
export const validRange = (r?: string) => (RANGES.some(([k]) => k === r) ? (r as string) : "90");
export function since(range: string) {
  const n = Number(range);
  if (!Number.isFinite(n)) return "1970-01-01 00:00:00";
  return new Date(Date.now() - n * 864e5).toISOString().slice(0, 19).replace("T", " ");
}
const ts = (s: string | null) => (s ? new Date(s.replace(" ", "T") + "Z").getTime() : NaN);
const hours = (a: string | null, b: string | null) => (ts(b) - ts(a)) / 36e5;
const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
export const fmtHours = (h: number | null) => (h === null || !Number.isFinite(h) ? "—" : h < 48 ? `${h.toFixed(1)} h` : `${(h / 24).toFixed(1)} days`);
export const pct = (n: number | null) => (n === null || !Number.isFinite(n) ? "—" : `${n.toFixed(0)}%`);

type QRow = { id: number; status: string; disc: number; vat: number; valid_days: number; created_at: string; issued_at: string | null; accepted_at: string | null; sub: number; mb: number; mc: number };
export type QuoteTotal = QRow & { total: number };

export function quoteRows(sinceTs: string): QuoteTotal[] {
  const rows = db().prepare(
    `SELECT q.id,q.status,q.disc,q.vat,q.valid_days,q.created_at,q.issued_at,q.accepted_at,
      COALESCE(SUM(l.qty*l.price),0) sub,
      COALESCE(SUM(CASE WHEN l.kind='M' AND l.nc=0 THEN l.qty*l.price END),0) mb,
      COALESCE(SUM(CASE WHEN l.kind='M' AND l.nc=0 THEN l.qty*l.cost END),0) mc
     FROM quotes q LEFT JOIN quote_lines l ON l.quote_id=q.id WHERE q.created_at>=? GROUP BY q.id`
  ).all(sinceTs) as QRow[];
  return rows.map((r) => ({ ...r, total: r.sub * (1 - r.disc / 100) * (r.vat ? 1.15 : 1) }));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function overview(range: string) {
  const s = since(range), now = Date.now();
  const reqs = db().prepare("SELECT service,property_type,urgent,created_at FROM requests WHERE created_at>=?").all(s) as
    { service: string; property_type: string; urgent: number; created_at: string }[];
  const count = (key: "service" | "property_type") => {
    const m = new Map<string, number>();
    reqs.forEach((r) => m.set(r[key], (m.get(r[key]) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  };
  const weekly: [string, number][] = Array.from({ length: 12 }, (_, i) => {
    const end = new Date(now - (11 - i) * 7 * 864e5);
    return [`${end.getDate()} ${MONTHS[end.getMonth()]}`, 0];
  });
  db().prepare("SELECT created_at FROM requests WHERE created_at>=?").all(new Date(now - 84 * 864e5).toISOString().slice(0, 19).replace("T", " ")).forEach((r: { created_at: string }) => {
    const idx = 11 - Math.floor((now - ts(r.created_at)) / (7 * 864e5));
    if (idx >= 0 && idx < 12) weekly[idx][1]++;
  });

  const funnel = db().prepare(
    `SELECT COUNT(*) total,
      COALESCE(SUM(EXISTS(SELECT 1 FROM quotes q WHERE q.request_id=r.id)),0) quoted,
      COALESCE(SUM(EXISTS(SELECT 1 FROM quotes q WHERE q.request_id=r.id AND q.issued_at IS NOT NULL)),0) issued,
      COALESCE(SUM(EXISTS(SELECT 1 FROM quotes q WHERE q.request_id=r.id AND q.status='Accepted')),0) accepted
     FROM requests r WHERE r.created_at>=?`
  ).get(s) as { total: number; quoted: number; issued: number; accepted: number };

  const quotes = quoteRows(s);
  const issued = quotes.filter((q) => q.issued_at);
  const accepted = quotes.filter((q) => q.status === "Accepted");
  const declined = quotes.filter((q) => q.status === "Declined").length;
  const expired = quotes.filter((q) => q.status === "Issued" && ts(q.issued_at) + q.valid_days * 864e5 < now).length;
  const mb = quotes.reduce((a, q) => a + q.mb, 0), mc = quotes.reduce((a, q) => a + q.mc, 0);

  const monthly: [string, number][] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(new Date().getFullYear(), new Date().getMonth() - (5 - i), 1);
    return [`${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`, 0];
  });
  quoteRows("1970-01-01 00:00:00").filter((q) => q.accepted_at && q.accepted_at >= s).forEach((q) => {
    const d = new Date(ts(q.accepted_at)), n = new Date();
    const idx = 5 - ((n.getFullYear() - d.getFullYear()) * 12 + n.getMonth() - d.getMonth());
    if (idx >= 0 && idx < 6) monthly[idx][1] += q.total;
  });

  const toQuote = db().prepare("SELECT r.created_at rc,q.created_at qc FROM quotes q JOIN requests r ON r.id=q.request_id WHERE q.created_at>=?").all(s) as { rc: string; qc: string }[];
  return {
    requests: { total: reqs.length, urgent: reqs.filter((r) => r.urgent).length, byService: count("service"), byType: count("property_type"), weekly },
    funnel,
    quotes: {
      created: quotes.length, issued: issued.length, accepted: accepted.length, declined, expired,
      winRate: issued.length ? (accepted.length / issued.length) * 100 : null,
      acceptedValue: accepted.reduce((a, q) => a + q.total, 0),
      issuedValue: issued.reduce((a, q) => a + q.total, 0),
      avgValue: issued.length ? issued.reduce((a, q) => a + q.total, 0) / issued.length : null,
      margin: mb ? ((mb - mc) / mb) * 100 : null,
      hoursToQuote: avg(toQuote.map((r) => hours(r.rc, r.qc))),
      hoursToDecision: avg(accepted.map((q) => hours(q.issued_at, q.accepted_at)).filter(Number.isFinite)),
      monthly,
    },
  };
}

/* ---------- technicians ---------- */
export type TechStat = {
  id: number; name: string; active: number; assigned: number; done: number; open: number;
  completion: number | null; avgHours: number | null; value: number;
};
type JobRow = { id: number; tech_id: number; status: string; created_at: string; assigned_at: string | null; completed_at: string | null; quote_id: number | null; client: string };

function jobData(sinceTs: string) {
  const jobs = db().prepare("SELECT id,tech_id,status,created_at,assigned_at,completed_at,quote_id,client FROM jobs WHERE tech_id IS NOT NULL AND created_at>=?").all(sinceTs) as JobRow[];
  const value = new Map<number, number>();
  quoteRows("1970-01-01 00:00:00").forEach((q) => value.set(q.id, q.total));
  return { jobs, value };
}

export function jobMetrics(j: JobRow, d: ReturnType<typeof jobData>) {
  return {
    hours: j.completed_at ? hours(j.assigned_at ?? j.created_at, j.completed_at) : null,
    value: j.quote_id ? d.value.get(j.quote_id) ?? 0 : 0,
  };
}

export function techStats(sinceTs: string, onlyId?: number): TechStat[] {
  const techs = (onlyId
    ? db().prepare("SELECT id,name,active FROM users WHERE role='TECH' AND id=?").all(onlyId)
    : db().prepare("SELECT id,name,active FROM users WHERE role='TECH' ORDER BY name").all()) as { id: number; name: string; active: number }[];
  const d = jobData(sinceTs);
  return techs.map((t) => {
    const mine = d.jobs.filter((j) => j.tech_id === t.id), done = mine.filter((j) => j.status === "Completed");
    const dm = done.map((j) => jobMetrics(j, d));
    return {
      ...t, assigned: mine.length, done: done.length, open: mine.length - done.length,
      completion: mine.length ? (done.length / mine.length) * 100 : null,
      avgHours: avg(dm.map((x) => x.hours).filter((h): h is number => h !== null && Number.isFinite(h))),
      value: dm.reduce((a, x) => a + x.value, 0),
    };
  });
}

export function techJobs(techId: number, sinceTs: string) {
  const d = jobData(sinceTs);
  return d.jobs.filter((j) => j.tech_id === techId).sort((a, b) => b.id - a.id).map((j) => ({ job: j, ...jobMetrics(j, d) }));
}

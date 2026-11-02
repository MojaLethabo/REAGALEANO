export function Bars({ rows, fmt }: { rows: [string, number][]; fmt?: (n: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  if (!rows.length) return <p className="muted">No data in this period.</p>;
  return (
    <div className="bars">
      {rows.map(([l, v]) => (
        <div className="bar" key={l}>
          <span className="bl">{l}</span>
          <span className="bt"><i style={{ width: `${(v / max) * 100}%` }} /></span>
          <b>{fmt ? fmt(v) : v}</b>
        </div>
      ))}
    </div>
  );
}

export function Columns({ rows, fmt, label }: { rows: [string, number][]; fmt?: (n: number) => string; label: string }) {
  const max = Math.max(1, ...rows.map((r) => r[1])), W = rows.length * 54, H = 150;
  return (
    <svg viewBox={`0 0 ${W} ${H + 40}`} className="cols" role="img" aria-label={label}>
      {rows.map(([l, v], i) => {
        const h = (v / max) * H;
        return (
          <g key={l} transform={`translate(${i * 54 + 8},0)`}>
            <rect x="0" y={H - h + 16} width="38" height={Math.max(h, v ? 2 : 0)} rx="4" fill="var(--sky)" />
            <text x="19" y={H - h + 11} textAnchor="middle" className="cv">{v ? (fmt ? fmt(v) : v) : ""}</text>
            <text x="19" y={H + 32} textAnchor="middle" className="cl">{l}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function RangeTabs({ base, range, ranges }: { base: string; range: string; ranges: [string, string][] }) {
  return (
    <div className="chips" role="tablist" aria-label="Date range">
      {ranges.map(([k, l]) => <a key={k} href={`${base}?range=${k}`} className={k === range ? "on" : ""} aria-current={k === range ? "true" : undefined}>{l}</a>)}
    </div>
  );
}

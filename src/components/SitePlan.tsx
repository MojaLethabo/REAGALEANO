// A line drawing of a protected property. The focused system is highlighted, the rest are dimmed.
export default function SitePlan({ focus }: { focus: "cam" | "solar" | "perimeter" }) {
  const d = (k: string) => (focus === k ? "" : "dim");
  return (
    <svg className="plan" viewBox="0 0 520 330" role="img" aria-label="Illustration of a property with a camera, solar panels, an electric fence and a gate">
      <line className="gl" x1="10" y1="270" x2="510" y2="270" />
      <rect className="st" x="190" y="140" width="170" height="130" />
      <polygon className="st" points="180,140 275,92 370,140" />
      <rect className="st" x="262" y="196" width="30" height="74" /><rect className="st" x="208" y="170" width="34" height="28" /><rect className="st" x="312" y="170" width="34" height="28" />
      <g className={d("solar")}><polygon className="bl" points="228,126 262,108 282,118 248,136" /><polygon className="bl" points="290,122 324,106 344,116 310,134" /><text x="228" y="86">Solar and backup</text></g>
      <g className={d("cam")}><polygon className="cone" points="150,150 192,225 130,235" /><line className="pole" x1="140" y1="270" x2="140" y2="140" /><rect className="cam" x="128" y="130" width="30" height="16" rx="3" /><text x="108" y="120">CCTV</text></g>
      <g className={d("perimeter")}>
        <g className="fn"><line x1="26" y1="270" x2="26" y2="206" /><line x1="56" y1="270" x2="56" y2="206" /><line x1="86" y1="270" x2="86" y2="206" /><line x1="26" y1="216" x2="86" y2="216" /><line x1="26" y1="232" x2="86" y2="232" /><line x1="26" y1="248" x2="86" y2="248" /></g>
        <g className="fn"><line x1="400" y1="270" x2="400" y2="200" /><line x1="500" y1="270" x2="500" y2="200" /></g>
        <rect className="gate" x="404" y="214" width="92" height="46" /><rect className="mot" x="384" y="236" width="14" height="24" />
        <text x="20" y="196">Fence</text><text x="396" y="190">Gate motor</text>
      </g>
    </svg>
  );
}

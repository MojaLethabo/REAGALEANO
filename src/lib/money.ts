export const R = (n: number) =>
  "R " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const sell = (cost: number, markup: number) => Math.round(cost * (1 + markup / 100) * 100) / 100;

export type Line = { kind: "M" | "L"; qty: number; price: number; cost: number; nc: number };

export function calc(lines: Line[], disc: number, vat: boolean) {
  let m = 0, l = 0, mb = 0, mc = 0;
  for (const x of lines) {
    const amt = x.qty * x.price;
    if (x.kind === "L") l += amt;
    else {
      m += amt;
      if (!x.nc) { mb += amt; mc += x.qty * x.cost; }
    }
  }
  const sub = m + l, d = (sub * disc) / 100, net = sub - d, v = vat ? net * 0.15 : 0;
  return { m, l, sub, d, net, vat: v, total: net + v, margin: mb ? ((mb - mc) / mb) * 100 : 0 };
}

export const fmtDate = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });

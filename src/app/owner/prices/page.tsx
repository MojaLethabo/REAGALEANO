import { db } from "@/lib/db";
import { R, sell } from "@/lib/money";
import AutoForm from "@/components/AutoForm";
import { savePriceItem } from "../actions";

type I = { id: number; name: string; category: string; unit: string; cost: number; markup: number; active: number };

export default function Prices() {
  const items = db().prepare("SELECT * FROM price_items ORDER BY category,name").all() as I[];
  const cats = [...new Set(items.map((i) => i.category))];
  return (
    <>
      <div className="inline between" style={{ marginBottom: 6 }}>
        <div><h1 className="h1s">Products &amp; Services</h1><p className="muted" style={{ margin: 0 }}>{items.length} items · changes save automatically</p></div>
        <details className="addbox"><summary className="btn">+ Add Item</summary>
          <form action={savePriceItem} className="qcard addform">
            <div className="g2"><div><label className="cap">Item</label><input name="name" required /></div><div><label className="cap">Category</label><input name="category" list="cats" required /></div></div>
            <div className="g3"><div><label className="cap">Unit</label><input name="unit" defaultValue="each" /></div><div><label className="cap">Cost (R)</label><input name="cost" type="number" step="0.01" min="0" required /></div><div><label className="cap">Markup %</label><input name="markup" type="number" step="0.1" min="0" defaultValue={40} /></div></div>
            <input type="hidden" name="active" value="on" /><button className="btn" style={{ marginTop: 12 }}>Add item</button>
          </form></details>
      </div>
      <datalist id="cats">{cats.map((c) => <option key={c} value={c} />)}</datalist>
      <p className="muted">Sell price = cost plus markup. Labour tasks are flat amounts: set the cost to the amount you charge and the markup to 0. Prices are copied into each quote when you add them, so editing here never changes old quotes.</p>
      {items.map((i, n) => (
        <AutoForm action={savePriceItem} className="prodrow" key={i.id}>
          <input type="hidden" name="id" value={i.id} />
          <span className="numtile">{n + 1}</span>
          <div className="pname"><input name="name" defaultValue={i.name} aria-label="Item" className="plain" />
            <div className="inline"><input name="category" defaultValue={i.category} aria-label="Category" className="mini wide" /><input name="unit" defaultValue={i.unit} aria-label="Unit" className="mini" /></div></div>
          <label className="pf">Cost<input name="cost" type="number" step="0.01" defaultValue={i.cost} className="mini" /></label>
          <label className="pf">Markup %<input name="markup" type="number" step="0.1" defaultValue={i.markup} className="mini" /></label>
          <div className="psell"><b>{R(i.category === "Labour" ? i.cost : sell(i.cost, i.markup))}</b><small>per {i.unit}</small></div>
          <label className="chk pact"><input type="checkbox" name="active" defaultChecked={!!i.active} /> Active</label>
        </AutoForm>
      ))}
    </>
  );
}

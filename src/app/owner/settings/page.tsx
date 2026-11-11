import { company } from "@/lib/company";
import { saveSettings } from "../actions";

export default function Settings() {
  const c = company();
  const f = (k: keyof typeof c, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label>{label}</label><input name={k} defaultValue={c[k]} {...extra} /></div>
  );
  return (
    <>
      <h1 className="h1s">Settings</h1>
      <p className="muted">Letterhead, branding, banking details and terms printed on every quotation. Changes apply to all quotes you preview or download.</p>
      <form action={saveSettings}>
        <div className="card"><h3>Company letterhead</h3>
          <div className="g2">{f("legal", "Legal name")}{f("trading", "Trading name (header)")}</div>
          {f("tagline", "Tagline")}
          <div className="g2">{f("reg", "Registration number")}{f("address", "Address")}</div>
          <div className="g3">{f("phone", "Phone")}{f("email", "Email", { type: "email" })}{f("website", "Website")}</div>
        </div>
        <div className="card"><h3>Public website</h3>
          <p className="muted">What visitors see in the header, footer, contact page and home page. Leave the hours blank if you would rather not show them.</p>
          <div className="g3">{f("sitePhone", "Phone / WhatsApp number")}{f("siteEmail", "Email", { type: "email" })}{f("hours", "Business hours (optional)")}</div>
          <label>Highlights strip (one per line: value | label)</label>
          <textarea name="stats" defaultValue={c.stats} style={{ minHeight: 110 }} />
          <p className="muted"><small>Add real numbers only, for example &quot;120|Installations completed&quot;. Do not estimate.</small></p>
          <label>Brands you install (comma separated, optional)</label>
          <input name="brands" defaultValue={c.brands} placeholder="e.g. Hikvision, Nemtek, Victron" />
        </div>
        <div className="card"><h3>Branding</h3>
          <label>Brand colour (quote header and headings)</label>
          <input name="brand" type="color" defaultValue={c.brand} style={{ width: 90, height: 42, padding: 2 }} />
        </div>
        <div className="card"><h3>Banking details</h3>
          <p className="muted">Printed on quotes only when an account number is set. Check these carefully: clients pay into this account.</p>
          <div className="g2">{f("bankAccountName", "Account name")}{f("bankName", "Bank")}</div>
          <div className="g2">{f("bankAccountNumber", "Account number", { inputMode: "numeric" })}{f("bankAccountType", "Account type")}</div>
        </div>
        <div className="card"><h3>Quotation defaults</h3>
          <div style={{ maxWidth: 200 }}>{f("validDays", "Valid for (days)", { type: "number", min: 1, max: 90 })}</div>
          <label>Terms and conditions (one per line)</label>
          <textarea name="terms" defaultValue={c.terms} style={{ minHeight: 140 }} />
        </div>
        <button className="btn">Save settings</button>
      </form>
    </>
  );
}

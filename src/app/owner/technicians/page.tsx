import Link from "next/link";
import { db } from "@/lib/db";
import { toggleTech, updateTech } from "./actions";
import { AddTech, ResetPassword } from "./TechForms";

type T = { id: number; name: string; email: string; phone: string; active: number; must_change: number };

export default function Technicians() {
  const techs = db().prepare("SELECT id,name,email,phone,active,must_change FROM users WHERE role='TECH' ORDER BY active DESC,name").all() as T[];
  return (
    <>
      <h1 className="h1s">Technicians</h1>
      <p className="muted">Add technicians, update their details, reset passwords and deactivate leavers. Technician accounts never see prices.</p>
      <AddTech />
      {techs.map((t) => (
        <div className="card" key={t.id}>
          <div className="inline between">
            <b>{t.name}</b> <Link className="lnk" href={`/owner/analytics/technicians/${t.id}`}>View analytics</Link>
            <span><span className={"badge " + (t.active ? "g" : "u")}>{t.active ? "Active" : "Deactivated"}</span>{t.must_change ? <small className="muted"> must change password</small> : null}</span>
          </div>
          <form action={updateTech} className="g3" style={{ marginTop: 8 }}>
            <input type="hidden" name="id" value={t.id} />
            <div><label>Name</label><input name="name" defaultValue={t.name} required /></div>
            <div><label>Email</label><input name="email" type="email" defaultValue={t.email} required /></div>
            <div><label>Phone</label><input name="phone" defaultValue={t.phone} /></div>
            <div><button className="btn sm">Save details</button></div>
          </form>
          <div className="inline" style={{ marginTop: 10 }}>
            <ResetPassword id={t.id} />
            <form action={toggleTech}><input type="hidden" name="id" value={t.id} /><button className="btn sm alt">{t.active ? "Deactivate" : "Reactivate"}</button></form>
          </div>
        </div>
      ))}
    </>
  );
}

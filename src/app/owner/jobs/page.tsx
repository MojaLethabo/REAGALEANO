import { db } from "@/lib/db";
import AutoForm from "@/components/AutoForm";
import { assignJob, reopenJob, updateJobContact } from "../actions";

type J = { id: number; client: string; address: string; client_phone: string; client_email: string; scope: string; status: string; tech_id: number | null };
type M = { job_id: number; name: string; planned: number; unit: string };

export default function Jobs() {
  const jobs = db().prepare("SELECT id,client,address,client_phone,client_email,scope,status,tech_id FROM jobs ORDER BY (status='Open') DESC,id DESC").all() as J[];
  const mats = db().prepare("SELECT job_id,name,planned,unit FROM job_materials ORDER BY id").all() as M[];
  const techs = db().prepare("SELECT id,name,active FROM users WHERE role='TECH' ORDER BY name").all() as { id: number; name: string; active: number }[];
  return (
    <>
      <h1 className="h1s">Jobs</h1>
      <p className="muted">Created when you mark a quote as accepted. Assign each job to a technician. They see the client&apos;s address and phone, the scope and the materials, never prices.</p>
      {!jobs.length && <div className="card">No jobs yet.</div>}
      {jobs.map((j) => (
        <div className="card" key={j.id}>
          <div className="inline between"><b>J-{String(j.id).padStart(3, "0")} · {j.client}</b><span className={"badge " + (j.status === "Completed" ? "g" : "")}>{j.status}</span></div>
          <p className="muted" style={{ whiteSpace: "pre-line" }}>{j.scope}</p>
          <AutoForm action={updateJobContact} className="g3">
            <input type="hidden" name="job" value={j.id} />
            <div><label className="cap">Address</label><input name="address" defaultValue={j.address} /></div>
            <div><label className="cap">Client phone</label><input name="phone" type="tel" defaultValue={j.client_phone} /></div>
            <div><label className="cap">Client email</label><input name="email" type="email" defaultValue={j.client_email} /></div>
          </AutoForm>
          <div className="inline" style={{ marginTop: 12 }}>
            <AutoForm action={assignJob} className="inline" delay={100}><input type="hidden" name="job" value={j.id} />
              <label className="cap" style={{ margin: 0 }}>Technician</label>
              <select name="tech" defaultValue={j.tech_id ?? ""} aria-label="Technician"><option value="">Unassigned</option>
                {techs.filter((t) => t.active || t.id === j.tech_id).map((t) => <option key={t.id} value={t.id}>{t.name}{t.active ? "" : " (inactive)"}</option>)}</select></AutoForm>
            {j.status === "Completed" && <form action={reopenJob}><input type="hidden" name="job" value={j.id} /><button className="btn sm alt">Reopen job</button></form>}
          </div>
          <p><small className="muted">{mats.filter((m) => m.job_id === j.id).map((m) => `${m.name} × ${m.planned}`).join(" · ")}</small></p>
        </div>
      ))}
    </>
  );
}

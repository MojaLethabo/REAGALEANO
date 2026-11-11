"use client";
import { useActionState, useEffect, useRef } from "react";
import { createProject, type ProjState } from "./actions";

export default function ProjectForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [s, action, pending] = useActionState<ProjState, FormData>(createProject, {});
  useEffect(() => { if (s.ok) ref.current?.reset(); }, [s]);
  return (
    <form ref={ref} action={action} className="qcard" style={{ padding: 18 }}>
      <h3>Add a project</h3>
      <div className="g3">
        <div><label className="cap" htmlFor="pt">Project title *</label><input id="pt" name="title" required placeholder="e.g. Estate gate and CCTV upgrade" /></div>
        <div><label className="cap" htmlFor="pc">Client or location</label><input id="pc" name="client" placeholder="e.g. Fourways" /></div>
        <div><label className="cap" htmlFor="pk">Type</label><select id="pk" name="category"><option>Residential</option><option>Commercial</option><option>Industrial</option></select></div>
      </div>
      <label className="cap" htmlFor="pp">Photo (JPG, PNG or WebP, up to 5 MB) *</label>
      <input id="pp" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required />
      <p className="muted"><small>Only publish photos of work you are allowed to show. Check with the client first, and avoid number plates, faces and house numbers.</small></p>
      {s.error && <div className="note w" role="alert">{s.error}</div>}
      {s.ok && <div className="note ok" role="status">Project added. It now appears on the website.</div>}
      <button className="btn" disabled={pending}>{pending ? "Uploading…" : "Add project"}</button>
    </form>
  );
}

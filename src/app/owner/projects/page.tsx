import { db } from "@/lib/db";
import ConfirmButton from "@/components/ConfirmButton";
import ProjectForm from "./ProjectForm";
import { deleteProject } from "./actions";

type P = { id: number; title: string; client: string; category: string; photo: string };

export default function Projects() {
  const rows = db().prepare("SELECT id,title,client,category,photo FROM projects ORDER BY id DESC").all() as P[];
  return (
    <>
      <h1 className="h1s">Projects</h1>
      <p className="muted">Photos of finished work. They appear in the gallery on the website home page. Real project photos are the strongest thing a security installer can show.</p>
      <ProjectForm />
      <div className="pgrid">
        {rows.map((p) => (
          <div className="qcard" key={p.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/uploads/${p.photo}`} alt={p.title} className="pimg" loading="lazy" />
            <div style={{ padding: 12 }}>
              <b>{p.title}</b><br /><small className="muted">{[p.client, p.category].filter(Boolean).join(" · ")}</small>
              <form action={deleteProject} style={{ marginTop: 8 }}><input type="hidden" name="id" value={p.id} /><ConfirmButton className="btn sm alt del" message="Remove this project from the website?">Remove</ConfirmButton></form>
            </div>
          </div>
        ))}
        {!rows.length && <div className="card">No projects yet.</div>}
      </div>
    </>
  );
}

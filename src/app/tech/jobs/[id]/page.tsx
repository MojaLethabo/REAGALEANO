import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getJob } from "@/lib/tech";
import { mapsHref, telHref, whatsappHref } from "@/lib/phone";
import { completeJob } from "../../actions";

export default async function TechJobPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireRole("TECH");
  const { id } = await params;
  const data = getJob(Number(id), u.id);
  if (!data) notFound();
  const { job, mats } = data;
  return (
    <>
      <p><Link href="/tech">← My jobs</Link></p>
      <h1 className="h1s">J-{String(job.id).padStart(3, "0")} · {job.client} <span className={"badge " + (job.status === "Completed" ? "g" : "")}>{job.status}</span></h1>

      <div className="card">
        <h3>Client</h3>
        <p style={{ margin: "6px 0" }}><b>{job.client}</b></p>
        {job.client_phone ? (
          <div className="cbtns">
            <a className="bigbtn" href={telHref(job.client_phone)}>Call {job.client_phone}</a>
            <a className="bigbtn alt" href={whatsappHref(job.client_phone)} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        ) : <div className="note w">No phone number on file. Ask the owner.</div>}
        {job.client_email && <p className="muted">{job.client_email}</p>}
        <h3 style={{ marginTop: 14 }}>Address</h3>
        <p style={{ margin: "6px 0" }}>{job.address || "No address on file. Ask the owner."}</p>
        {job.address && <a className="bigbtn alt" href={mapsHref(job.address)} target="_blank" rel="noreferrer">Navigate</a>}
      </div>

      <div className="card"><h3>Work to do</h3><p style={{ whiteSpace: "pre-line" }}>{job.scope || "See the owner for the scope."}</p></div>

      {mats.length > 0 && (
        <div className="card"><h3>Materials</h3>
          {mats.map((m) => <div className="mat" key={m.id}><span>{m.name}</span><b>{m.planned} {m.unit}</b></div>)}
        </div>
      )}

      {job.status === "Open"
        ? <form action={completeJob}><input type="hidden" name="job" value={job.id} /><button className="btn w">Mark job complete</button></form>
        : <div className="note ok">This job is complete. Ask the owner if it needs to be reopened.</div>}
    </>
  );
}

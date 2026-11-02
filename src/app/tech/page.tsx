import Link from "next/link";
import { requireRole } from "@/lib/session";
import { listJobs } from "@/lib/tech";

export default async function TechHome() {
  const u = await requireRole("TECH");
  const jobs = listJobs(u.id);
  return (
    <>
      <h1 className="h1s">My jobs</h1>
      {!jobs.length && <div className="card">No jobs assigned to you yet.</div>}
      {jobs.map((j) => (
        <Link key={j.id} href={`/tech/jobs/${j.id}`} className="card jl">
          <div>
            <b>J-{String(j.id).padStart(3, "0")} · {j.client}</b><br />
            <span className="muted">{j.address || "No address yet"}</span>
          </div>
          <span className={"badge " + (j.status === "Completed" ? "g" : "")}>{j.status}</span>
        </Link>
      ))}
    </>
  );
}

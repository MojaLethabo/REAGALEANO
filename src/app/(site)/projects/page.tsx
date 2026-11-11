import type { Metadata } from "next";
import ProjectGrid, { type Project } from "@/components/ProjectGrid";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "Projects", description: "Photos of recent security, access control, gate, fencing and solar backup power installations." };

export default function Projects() {
  const projects = db().prepare("SELECT id,title,client,category,photo FROM projects ORDER BY id DESC").all() as Project[];
  return (
    <section className="wrap sec">
      <h1>Projects</h1>
      <p className="lead">A selection of our recent work.</p>
      {projects.length ? <ProjectGrid projects={projects} /> : <p className="muted">Project photos are coming soon.</p>}
    </section>
  );
}

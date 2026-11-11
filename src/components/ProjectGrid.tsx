import Image from "next/image";

export type Project = { id: number; title: string; client: string; category: string; photo: string };

export default function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="gallery">
      {projects.map((p) => (
        <figure className="gitem" key={p.id}>
          <div className="gimg"><Image src={`/uploads/${p.photo}`} alt={p.title} fill sizes="(max-width: 700px) 100vw, 25vw" /></div>
          <figcaption><b>{p.title}</b><span>{[p.client, p.category].filter(Boolean).join(" · ")}</span></figcaption>
        </figure>
      ))}
    </div>
  );
}

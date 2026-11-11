import Link from "next/link";
import HeroSlider from "@/components/HeroSlider";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import ProjectGrid, { type Project } from "@/components/ProjectGrid";
import { company } from "@/lib/company";
import { FAQ, SERVICES, STEPS } from "@/lib/content";
import { db } from "@/lib/db";
import { telHref } from "@/lib/phone";

const TILES = [0, 1, 4, 5, 7, 2, 3].map((i) => SERVICES[i]);
const AUDIENCE = [
  ["Residential", "Homes, apartment buildings, complexes and estates: entrance cameras, intercoms, gates, fencing and community watch.", "/services"],
  ["Commercial", "Offices, retail and corporate sites: CCTV, access control, central viewing and backup power.", "/services"],
  ["Industrial", "Factories, warehouses and yards: perimeter protection, restricted-area access and monitoring-room viewing.", "/services"],
  ["Quick support", "Something not working? We offer 24-hour support, with remote troubleshooting and site assistance.", "/contact?service=Other"],
] as const;

export default function Home() {
  const co = company();
  const stats = co.stats.split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((p) => p.length >= 2 && p[0]);
  const brands = co.brands.split(",").map((b) => b.trim()).filter(Boolean);
  const projects = db().prepare("SELECT id,title,client,category,photo FROM projects ORDER BY id DESC LIMIT 8").all() as Project[];
  return (
    <>
      <HeroSlider phone={co.sitePhone} tel={telHref(co.sitePhone)} />

      <section className="wrap sec">
        <div className="two">
          <div>
            <h2>Welcome to Reagaleano</h2>
            <p className="lead">We bring CCTV, access control, gate automation and perimeter protection together with the electrical, solar, backup power and network infrastructure they depend on.</p>
            <ul className="checks"><li>Every quote starts with a site assessment</li><li>Backup power planned into every system</li><li>New installations, upgrades, fault finding and maintenance</li><li>24-hour support for faults</li></ul>
            <div className="row"><Link className="btn" href="/about">About us</Link><Link className="btn alt" href="/services">All services</Link></div>
          </div>
          <div className="aud">
            {AUDIENCE.map(([t, d, href]) => <Link key={t} href={href} className="audtile"><h3>{t}</h3><p>{d}</p></Link>)}
          </div>
        </div>
      </section>

      <div className="wrap"><ul className="stats">{stats.map(([v, l]) => <li key={l}><b>{v}</b>{l}</li>)}</ul></div>

      <section className="wrap sec"><h2>Our services</h2><p className="lead">Choose a service and we will take you straight to a request.</p>
        <div className="tiles">
          {TILES.map((s) => (
            <Link key={s.name} className="tile" href={`/contact?service=${encodeURIComponent(s.name)}`}><Icon name={s.icon} /><h3>{s.name}</h3><span>{s.short}</span></Link>
          ))}
          <Link className="tile" href="/contact?service=Other"><Icon name="tool" /><h3>Something not working?</h3><span>A gate, camera or alarm fault. Tell us what is wrong.</span></Link>
        </div>
      </section>

      {projects.length > 0 && (
        <section className="wrap sec"><div className="inline between"><h2>Our latest projects</h2><Link className="lnk" href="/projects">See all projects</Link></div>
          <ProjectGrid projects={projects} /></section>
      )}

      {brands.length > 0 && (
        <section className="wrap sec"><h2>Brands we install</h2><ul className="brands">{brands.map((b) => <li key={b}>{b}</li>)}</ul></section>
      )}

      <section className="wrap sec"><h2>How it works</h2>
        <ol className="steps">{STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol></section>

      <section className="wrap sec"><h2>Frequently asked questions</h2>
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>

      <section className="wrap sec" id="appointment">
        <div className="two">
          <div>
            <h2>Schedule an appointment</h2>
            <p className="lead">Tell us what you need and we will call you back to arrange a site assessment.</p>
            <ul className="facts">
              <li><span>Call</span><a href={telHref(co.sitePhone)}>{co.sitePhone}</a></li>
              <li><span>Support</span>24-hour</li>
              {co.hours && <li><span>Office hours</span>{co.hours}</li>}
              <li><span>Email</span><a href={`mailto:${co.siteEmail}`}>{co.siteEmail}</a></li>
            </ul>
          </div>
          <div className="box"><h2>Get a call back</h2><p>Three details, and we will contact you.</p><ContactForm compact phone={co.sitePhone} /></div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import Image from "next/image";
import NavLinks from "@/components/NavLinks";
import { company } from "@/lib/company";
import { db } from "@/lib/db";
import { SERVICES } from "@/lib/content";
import { telHref, whatsappHref } from "@/lib/phone";

export const dynamic = "force-dynamic"; // reads settings and projects from the database

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const co = company();
  const hasProjects = !!db().prepare("SELECT 1 FROM projects LIMIT 1").get();
  const links: [string, string][] = [["/", "Home"], ["/about", "About us"], ["/services", "Services"], ...(hasProjects ? ([["/projects", "Projects"]] as [string, string][]) : []), ["/contact", "Contact us"]];
  const ld = { "@context": "https://schema.org", "@type": "LocalBusiness", name: "Reagaleano Electrical and Systems", telephone: co.sitePhone, email: co.siteEmail, areaServed: "Gauteng, South Africa" };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
      <div className="util"><div className="wrap">
        <Link className="utilbtn" href="/contact">Contact now</Link>
      </div></div>
      <header className="top"><div className="wrap">
        <Link className="brand" href="/"><Image className="logo" src="/logo.png" alt="Reagaleano Electrical, Systems and Automation" width={1190} height={674} priority /></Link>
        <NavLinks links={links} />
        <Link className="btn sm" href="/contact">Request a quote</Link>
      </div></header>
      <main>{children}</main>
      <footer><div className="wrap fgrid">
        <div><b>REAGALEANO</b> Electrical and Systems<small>Electronic security, access control, networking, automation and solar backup power for residential, commercial and industrial properties.</small><small>Reg. 2016/524578/07 · CSD MAAA1753516 · B-BBEE Level 1</small></div>
        <div><h4>Our services</h4>{SERVICES.slice(0, 6).map((s) => <small key={s.name}><Link href={`/contact?service=${encodeURIComponent(s.name)}`}>{s.name}</Link></small>)}</div>
        <div><h4>Support</h4><small>24-hour support</small>{co.hours && <small>Office: {co.hours}</small>}</div>
        <div><h4>Contact</h4><small><a href={telHref(co.sitePhone)}>{co.sitePhone}</a></small><small><a href={`mailto:${co.siteEmail}`}>{co.siteEmail}</a></small><small><Link href="/login">Staff login</Link></small></div>
      </div></footer>
      <nav className="mbar" aria-label="Quick contact">
        <a href={telHref(co.sitePhone)}>Call</a><a href={whatsappHref(co.sitePhone)}>WhatsApp</a><Link className="p" href="/contact">Get a quote</Link>
      </nav>
    </>
  );
}

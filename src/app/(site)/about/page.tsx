import type { Metadata } from "next";
import Link from "next/link";
import { STEPS } from "@/lib/content";

export const metadata: Metadata = { title: "About us", description: "Electronic security, access control, networking, automation and solar backup power for residential, commercial and industrial properties." };

export default function About() {
  return (
    <>
      <section className="wrap sec">
        <h1>About Reagaleano</h1>
        <p className="lead">Reagaleano Electrical and Systems delivers electronic security, access control, networking and automation for residential complexes, commercial buildings and corporate premises.</p>
        <div className="two">
          <div>
            <h2>One team for the whole system</h2>
            <p>We bring CCTV surveillance, biometric access, gate automation and perimeter protection together with the electrical, solar, backup power and network infrastructure they depend on.</p>
            <p>Our work covers new installations, upgrades, fault finding and maintenance, with remote viewing and monitoring arrangements tailored to each property.</p>
            <h2 style={{ marginTop: 26 }}>Who we work with</h2>
            <p>Property managers, body corporates, facilities teams and security teams who want better visibility, controlled access and systems that keep running.</p>
          </div>
          <div>
            <h2>Company details</h2>
            <ul className="facts">
              <li><span>Company</span>Reagaleano Electrical and Systems</li><li><span>Registration number</span>2016/524578/07</li>
              <li><span>CSD supplier number</span>MAAA1753516</li><li><span>B-BBEE</span>Level 1 Contributor</li>
              <li><span>Procurement recognition</span>135%</li><li><span>Support</span>24-hour</li>
            </ul>
            <div className="row"><Link className="btn" href="/contact">Contact us</Link></div>
          </div>
        </div>
      </section>
      <section className="wrap sec"><h2>How we work</h2>
        <ol className="steps">{STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol>
      </section>
    </>
  );
}

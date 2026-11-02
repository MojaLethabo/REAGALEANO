import Link from "next/link";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import { FAQ, SEGMENTS, SERVICES, STEPS } from "@/lib/content";

const TILES = [0, 1, 4, 5, 7, 2, 3].map((i) => SERVICES[i]);

export default function Home() {
  return (
    <>
      <div className="wrap hero">
        <div>
          <h1>Advanced technology for safety, automation and control</h1>
          <p className="lead">CCTV, access control, gate motors, electric fencing, networking and solar backup power for residential complexes, commercial buildings and corporate premises.</p>
          <ul className="checks"><li>Every quote starts with a site assessment</li><li>Backup power planned into every system</li><li>24-hour support for faults</li></ul>
          <div className="row"><Link className="btn" href="/contact">Request a quote</Link><a className="btn alt" href="tel:+27623750851">Call 062 375 0851</a></div>
        </div>
        <div className="box">
          <h2>Get a call back</h2>
          <p>Three details, and we will contact you to arrange a site assessment.</p>
          <ContactForm compact />
        </div>
      </div>
      <div className="wrap"><ul className="trust">
        <li><b>Level 1</b>B-BBEE contributor</li><li><b>135%</b>Procurement recognition</li><li><b>CSD</b>Registered supplier</li><li><b>24-hour</b>Support</li>
      </ul></div>

      <section className="wrap sec"><h2>What do you need?</h2><p className="lead">Choose a service and we will take you straight to a request.</p>
        <div className="tiles">
          {TILES.map((s) => (
            <Link key={s.name} className="tile" href={`/contact?service=${encodeURIComponent(s.name)}`}>
              <Icon name={s.icon} /><h3>{s.name}</h3><span>{s.short}</span>
            </Link>
          ))}
          <Link className="tile" href="/contact?service=Other"><Icon name="tool" /><h3>Something not working?</h3><span>A gate, camera or alarm fault. Tell us what is wrong.</span></Link>
        </div>
      </section>

      <section className="wrap sec"><h2>Why property managers choose one team for the whole system</h2>
        <div className="three">
          <div><h3>Everything works together</h3><p>Cameras, access, gates, fencing and network are planned as one system, so there is one company to call.</p></div>
          <div><h3>Power that keeps going</h3><p>Solar and battery backup are sized around your essential loads, so security keeps running through outages.</p></div>
          <div><h3>Support after handover</h3><p>We demonstrate everyday use, explain maintenance and support you under an agreed service scope.</p></div>
        </div>
      </section>

      <section className="wrap sec"><h2>Built for your type of property</h2>
        <div className="three">
          {SEGMENTS.map(([t, d, items]) => (
            <div key={t}><h3>{t}</h3><p>{d}</p><ul className="plain">{items.map((x) => <li key={x}>{x}</li>)}</ul></div>
          ))}
        </div>
      </section>

      <section className="wrap sec"><h2>How it works</h2>
        <ol className="steps">{STEPS.map(([t, d]) => <li key={t}><h3>{t}</h3><p>{d}</p></li>)}</ol>
      </section>

      <section className="wrap sec"><h2>Common questions</h2>
        {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
      </section>

      <section className="wrap sec"><div className="cta">
        <div><h2>Ready to secure your property?</h2><p>Tell us what you need and we will arrange a site assessment.</p></div>
        <div className="row"><Link className="btn" href="/contact">Request a quote</Link><a className="btn alt" href="tel:+27623750851">Call now</a></div>
      </div></section>
    </>
  );
}

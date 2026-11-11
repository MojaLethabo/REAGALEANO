"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import SitePlan from "./SitePlan";

const SLIDES = [
  { focus: "cam" as const, title: "Fast, reliable security installation", text: "CCTV, access control, alarms and networking for residential complexes, commercial buildings and corporate premises." },
  { focus: "solar" as const, title: "All-in-one solar and backup power", text: "Inverters, batteries and solar sized around your essential loads, so cameras, gates and alarms keep running through outages." },
  { focus: "perimeter" as const, title: "Gates and fencing that keep working", text: "Gate motors and electric fencing installed, repaired and maintained, with safety beams, battery backup and 24-hour fault support." },
];

export default function HeroSlider({ phone, tel }: { phone: string; tel: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 7000);
    return () => clearInterval(t);
  }, [paused]);
  const s = SLIDES[i];
  return (
    <section className="wrap hslider" role="region" aria-roledescription="carousel" aria-label="Highlights"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}>
      <div className="hslide" aria-live={paused ? "polite" : "off"}>
        <div>
          <h1>{s.title}</h1>
          <p className="lead">{s.text}</p>
          <div className="row"><Link className="btn" href="/contact">Request a quote</Link><a className="btn alt" href={tel}>Call {phone}</a></div>
        </div>
        <div className="plan-wrap"><SitePlan focus={s.focus} /></div>
      </div>
      <div className="dots" role="group" aria-label="Choose slide">
        {SLIDES.map((x, k) => <button key={x.title} className={k === i ? "on" : ""} onClick={() => setI(k)} aria-label={`Show slide ${k + 1}: ${x.title}`} aria-current={k === i} />)}
      </div>
    </section>
  );
}

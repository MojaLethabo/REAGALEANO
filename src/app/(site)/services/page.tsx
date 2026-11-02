import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/Icon";
import { CATS, SERVICES, type Cat } from "@/lib/content";

export const metadata: Metadata = { title: "Services", description: "CCTV, access control, alarms, networking, gate motors, electric fencing, electrical, solar and backup power, community watch and 24-hour support." };

export default function Services() {
  return (
    <section className="wrap sec">
      <h1>Services</h1>
      <p className="lead">Every solution starts with a site assessment, so the system fits your property, your users and your daily security needs.</p>
      {(Object.keys(CATS) as Cat[]).map((c) => (
        <div key={c}>
          <h2 className="grp">{CATS[c]}</h2>
          {SERVICES.filter((s) => s.cat === c).map((s) => (
            <div className="svc" key={s.name}>
              <div className="sh"><Icon name={s.icon} /><h3>{s.name}</h3></div>
              <p>{s.long}</p>
              <Link className="lnk" href={`/contact?service=${encodeURIComponent(s.name)}`}>Request this service</Link>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}

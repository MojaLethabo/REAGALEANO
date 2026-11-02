import Link from "next/link";
import NavLinks from "@/components/NavLinks";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="util"><div className="wrap">
        <span>24-hour support: <a href="tel:+27623750851"><b>062 375 0851</b></a></span>
        <span>B-BBEE Level 1 · CSD registered supplier</span>
      </div></div>
      <header className="top"><div className="wrap">
        <Link className="brand" href="/"><span className="mk" aria-hidden="true">R</span><span><b>REAGALEANO</b><small>Electrical and Systems</small></span></Link>
        <NavLinks />
        <Link className="btn sm" href="/contact">Request a quote</Link>
      </div></header>
      <main>{children}</main>
      <footer><div className="wrap">
        <div><b>REAGALEANO</b> Electrical and Systems<small>Reg. 2016/524578/07 · CSD MAAA1753516 · B-BBEE Level 1</small></div>
        <div><small>062 375 0851 · admin@reagaleano.co.za</small><small><Link href="/login">Staff login</Link></small></div>
      </div></footer>
      <nav className="mbar" aria-label="Quick contact">
        <a href="tel:+27623750851">Call</a><a href="https://wa.me/27623750851">WhatsApp</a><Link className="p" href="/contact">Get a quote</Link>
      </nav>
    </>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [["/", "Home"], ["/about", "About us"], ["/services", "Services"], ["/contact", "Contact us"]];

export default function NavLinks() {
  const path = usePathname();
  return (
    <nav className="m" aria-label="Main">
      {LINKS.map(([href, label]) => (
        <Link key={href} href={href} aria-current={path === href ? "page" : undefined}>{label}</Link>
      ))}
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const IC: Record<string, string> = {
  home: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  inbox: '<path d="M3 13l3-8h12l3 8v6H3zM3 13h5l1 3h6l1-3h5"/>',
  doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 13h7M9 17h7"/>',
  job: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V4h6v3"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0113 0M16 4.5a3.5 3.5 0 010 7M18 14.5a6.5 6.5 0 013.5 5.5"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M21 16l-5-5-8 8"/>',
  cog: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
};

export default function PanelNav({ links }: { links: [string, string, string?][] }) {
  const p = usePathname();
  return (
    <nav className="pnav" aria-label="Panel">
      {links.map(([href, label, icon]) => {
        const on = href === "/owner" || href === "/tech" ? p === href : p.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}>
            {icon && <svg className="pi" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: IC[icon] }} />}
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

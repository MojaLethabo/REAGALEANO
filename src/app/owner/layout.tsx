import { requireRole } from "@/lib/session";
import { logout } from "@/app/login/actions";
import PanelNav from "@/components/PanelNav";

export const dynamic = "force-dynamic";

export default async function OwnerLayout({ children }: { children: React.ReactNode }) {
  const u = await requireRole("OWNER");
  return (
    <div className="app">
      <aside className="side">
        <div className="brand"><span className="mk" aria-hidden="true">R</span><span><b>Reagaleano</b><small>Business Platform</small></span></div>
        <div className="sidelabel">MAIN</div>
        <PanelNav links={[
          ["/owner", "Dashboard", "home"], ["/owner/requests", "Requests", "inbox"], ["/owner/quotes", "Quotations", "doc"],
          ["/owner/jobs", "Jobs", "job"], ["/owner/analytics", "Analytics", "chart"], ["/owner/prices", "Products & Services", "tag"], ["/owner/projects", "Projects", "photo"],
          ["/owner/technicians", "Technicians", "users"], ["/owner/settings", "Settings", "cog"],
        ]} />
        <div className="who">
          <div className="inline"><span className="avatar" aria-hidden="true">{u.name.charAt(0).toUpperCase()}</span><span><b>{u.name}</b><small>Owner</small></span></div>
          <form action={logout}><button className="btn sm alt w">Sign out</button></form>
        </div>
      </aside>
      <div className="pmain">{children}</div>
    </div>
  );
}

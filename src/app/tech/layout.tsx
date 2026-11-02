import { requireRole } from "@/lib/session";
import { logout } from "@/app/login/actions";
import PanelNav from "@/components/PanelNav";

export const dynamic = "force-dynamic";

export default async function TechLayout({ children }: { children: React.ReactNode }) {
  const u = await requireRole("TECH");
  return (
    <div className="techapp">
      <header className="thead">
        <b>REAGALEANO</b><span className="muted">{u.name}</span>
        <form action={logout}><button className="btn sm alt">Sign out</button></form>
      </header>
      <PanelNav links={[["/tech", "My jobs"]]} />
      <div className="tmain">{children}</div>
    </div>
  );
}

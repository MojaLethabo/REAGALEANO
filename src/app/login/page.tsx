import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Staff login", robots: { index: false } };

export default async function Login() {
  const u = await getUser();
  if (u) redirect(u.role === "OWNER" ? "/owner" : "/tech");
  return (
    <div className="center">
      <div className="box" style={{ maxWidth: 400, width: "100%" }}>
        <Link className="brand" href="/"><span className="mk" aria-hidden="true">R</span><span><b>REAGALEANO</b><small>Staff login</small></span></Link>
        <h2 style={{ marginTop: 20 }}>Sign in</h2>
        <LoginForm />
      </div>
    </div>
  );
}

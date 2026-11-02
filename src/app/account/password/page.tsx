import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/session";
import PasswordForm from "./PasswordForm";

export const metadata: Metadata = { title: "Change password", robots: { index: false } };

export default async function Page() {
  const u = await getUser();
  if (!u) redirect("/login");
  return (
    <div className="center">
      <div className="box" style={{ maxWidth: 420, width: "100%" }}>
        <h2>Change your password</h2>
        <p className="muted">{u.must_change ? "You are using a temporary password. Choose your own to continue." : "Choose a new password."}</p>
        <PasswordForm />
      </div>
    </div>
  );
}

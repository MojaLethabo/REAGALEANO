"use client";
import { useActionState } from "react";
import { changePassword, type PwState } from "./actions";

export default function PasswordForm() {
  const [s, action, pending] = useActionState<PwState, FormData>(changePassword, {});
  return (
    <form action={action}>
      <label htmlFor="current">Current (temporary) password</label><input id="current" name="current" type="password" autoComplete="current-password" required />
      <label htmlFor="next">New password (10+ characters)</label><input id="next" name="next" type="password" autoComplete="new-password" minLength={10} required />
      <label htmlFor="confirm">Confirm new password</label><input id="confirm" name="confirm" type="password" autoComplete="new-password" required />
      {s.error && <div className="note w" role="alert">{s.error}</div>}
      <button className="btn w" type="submit" disabled={pending} style={{ marginTop: 16 }}>{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}

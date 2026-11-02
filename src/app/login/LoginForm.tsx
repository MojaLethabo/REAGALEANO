"use client";
import { useActionState } from "react";
import { login, type LoginState } from "./actions";

export default function LoginForm() {
  const [s, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action}>
      <label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required />
      {s.error && <div className="note w" role="alert">{s.error}</div>}
      <button className="btn w" type="submit" disabled={pending} style={{ marginTop: 16 }}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

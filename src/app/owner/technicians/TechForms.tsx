"use client";
import { useActionState } from "react";
import { createTech, resetTech, type TechState } from "./actions";

function Temp({ s }: { s: TechState }) {
  if (s.error) return <div className="note w" role="alert">{s.error}</div>;
  if (!s.temp) return null;
  return (
    <div className="note ok" role="status">
      Temporary password for <b>{s.who}</b>: <code>{s.temp}</code><br />
      Shown once. Pass it on privately. They must change it at first sign-in.
    </div>
  );
}

export function AddTech() {
  const [s, action, pending] = useActionState<TechState, FormData>(createTech, {});
  return (
    <form action={action} className="card">
      <h3>Add technician</h3>
      <div className="g3">
        <div><label htmlFor="n">Full name</label><input id="n" name="name" required /></div>
        <div><label htmlFor="e">Email (sign-in)</label><input id="e" name="email" type="email" required /></div>
        <div><label htmlFor="p">Phone</label><input id="p" name="phone" type="tel" /></div>
      </div>
      <Temp s={s} />
      <button className="btn" disabled={pending} style={{ marginTop: 12 }}>Add technician</button>
    </form>
  );
}

export function ResetPassword({ id }: { id: number }) {
  const [s, action, pending] = useActionState<TechState, FormData>(resetTech, {});
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button className="btn sm alt" disabled={pending}>Reset password</button>
      <Temp s={s} />
    </form>
  );
}

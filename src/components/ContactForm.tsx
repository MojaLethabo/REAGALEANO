"use client";
import { useActionState } from "react";
import { submitRequest, type FormState } from "@/app/actions/request";
import { PROPERTY_TYPES, REQUEST_KINDS, SERVICE_NAMES } from "@/lib/content";

export default function ContactForm({ compact = false, defaultService = "CCTV surveillance", phone = "" }: { compact?: boolean; defaultService?: string; phone?: string }) {
  const [s, action, pending] = useActionState<FormState, FormData>(submitRequest, { ok: false });
  const svc = SERVICE_NAMES.includes(defaultService) ? defaultService : "CCTV surveillance";

  if (s.ok)
    return (
      <div role="status">
        <div className="note ok">
          <b>{compact ? "Request received." : `Thank you${s.name && s.name !== "Call-back request" ? ", " + s.name : ""}.`}</b>{" "}
          We have received your request and will call you back to arrange a site assessment. For urgent faults call {phone || "us"}.
        </div>
      </div>
    );

  return (
    <form action={action} noValidate={false}>
      {!compact && (
        <div className="g2">
          <div><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required maxLength={100} /></div>
          <div><label htmlFor="phone">Phone</label><input id="phone" name="phone" type="tel" autoComplete="tel" required /></div>
        </div>
      )}
      {!compact && <><label htmlFor="email">Email (optional)</label><input id="email" name="email" type="email" autoComplete="email" /></>}
      <div className={compact ? undefined : "g2"}>
        <div><label htmlFor="service">{compact ? "I need" : "Service needed"}</label>
          <select id="service" name="service" defaultValue={svc}>{SERVICE_NAMES.map((n) => <option key={n}>{n}</option>)}</select></div>
        <div><label htmlFor="type">Property type</label>
          <select id="type" name="type">{PROPERTY_TYPES.map((n) => <option key={n}>{n}</option>)}</select></div>
      </div>
      {compact && <><label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="e.g. 082 555 0123" required /></>}
      {!compact && (
        <>
          <div className="g2">
            <div><label htmlFor="kind">Request type</label>
              <select id="kind" name="kind">{REQUEST_KINDS.map((n) => <option key={n}>{n}</option>)}</select></div>
            <div><label htmlFor="address">Site address</label><input id="address" name="address" autoComplete="street-address" /></div>
          </div>
          <label htmlFor="description">What do you need?</label><textarea id="description" name="description" maxLength={2000} />
          <label className="chk"><input type="checkbox" name="urgent" /> This is urgent</label>
        </>
      )}
      <div className="hp" aria-hidden="true"><label htmlFor="website">Leave empty</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="chk"><input type="checkbox" name="consent" /> I agree that Reagaleano may use my details to respond to this request (POPIA).</label>
      {s.error && <div className="note w" role="alert">{s.error}</div>}
      <button className={"btn" + (compact ? " w" : "")} type="submit" disabled={pending}>{pending ? "Sending…" : compact ? "Request a call back" : "Send request"}</button>
    </form>
  );
}

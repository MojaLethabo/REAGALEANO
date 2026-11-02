"use client";
import { useRef } from "react";
import { useFormStatus } from "react-dom";

function Status() {
  const { pending } = useFormStatus();
  return <span className="autosave" aria-live="polite">{pending ? "Saving…" : ""}</span>;
}

// A form that saves itself shortly after any field changes, so rows need no Save button.
export default function AutoForm({ action, children, className, delay = 450 }: { action: (fd: FormData) => void | Promise<void>; children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLFormElement>(null);
  const t = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return (
    <form ref={ref} action={action} className={className}
      onChange={() => { clearTimeout(t.current); t.current = setTimeout(() => ref.current?.requestSubmit(), delay); }}>
      {children}<Status />
    </form>
  );
}

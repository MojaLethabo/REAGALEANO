export default function Stepper({ status, expired }: { status: string; expired?: boolean }) {
  const steps = ["Draft", "Issued", "Accepted"], i = steps.indexOf(status);
  return (
    <ol className="stepper" aria-label="Quote status">
      {steps.map((s, k) => <li key={s} className={k <= i ? "on" : ""} aria-current={k === i ? "step" : undefined}>{s}</li>)}
      {i < 0 && <li className="end">{status}</li>}
      {expired && <li className="end">Expired</li>}
    </ol>
  );
}

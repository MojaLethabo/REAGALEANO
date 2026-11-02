"use client";
export default function PrintButton() {
  return <button className="btn" onClick={() => window.print()}>Download PDF (Save as PDF)</button>;
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { company } from "@/lib/company";
import QuoteDoc, { type DocLine, type DocQuote } from "@/components/QuoteDoc";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

// The page title becomes the suggested file name when saving as PDF.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const q = db().prepare("SELECT no FROM quotes WHERE id=?").get(Number(id)) as { no: string } | undefined;
  return { title: q ? q.no : "Quotation", robots: { index: false } };
}

export default async function PrintQuote({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("OWNER");
  const { id } = await params;
  const q = db().prepare("SELECT * FROM quotes WHERE id=?").get(Number(id)) as DocQuote | undefined;
  if (!q) notFound();
  const lines = db().prepare("SELECT * FROM quote_lines WHERE quote_id=? ORDER BY id").all(Number(id)) as DocLine[];
  return (
    <div className="printwrap">
      <div className="noprint inline between"><span className="muted">Choose “Save as PDF” in the print dialog.</span><PrintButton /></div>
      <QuoteDoc q={q} lines={lines} co={company()} />
    </div>
  );
}

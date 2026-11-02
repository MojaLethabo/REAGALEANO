import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { company } from "@/lib/company";
import { derivedStatus } from "@/lib/quote";
import type { DocLine } from "@/components/QuoteDoc";
import QuoteEditor, { type EditorItem, type EditorQuote } from "./QuoteEditor";

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("OWNER");
  const { id } = await params;
  const q = db().prepare("SELECT * FROM quotes WHERE id=?").get(Number(id)) as EditorQuote | undefined;
  if (!q) notFound();
  const lines = db().prepare("SELECT * FROM quote_lines WHERE quote_id=? ORDER BY id").all(q.id) as DocLine[];
  const items = db().prepare("SELECT id,name,unit,category,cost,markup FROM price_items WHERE active=1 ORDER BY category,name").all() as EditorItem[];
  return (
    <>
      <p><Link href="/owner/quotes">← Quotations</Link></p>
      <QuoteEditor key={q.id} quote={q} lines={lines} items={items} co={company()} expired={derivedStatus(q) === "Expired"} />
    </>
  );
}

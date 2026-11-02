"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";

// The only thing a technician changes: marking their own open job complete.
export async function completeJob(fd: FormData) {
  const u = await requireRole("TECH");
  const id = Number(fd.get("job"));
  const r = db().prepare("UPDATE jobs SET status='Completed',completed_at=datetime('now') WHERE id=? AND tech_id=? AND status='Open'").run(id, u.id);
  if (r.changes) {
    revalidatePath(`/tech/jobs/${id}`);
    revalidatePath("/tech");
  }
}

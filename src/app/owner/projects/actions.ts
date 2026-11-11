"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/session";
import { removeImage, saveImage } from "@/lib/uploads";

export type ProjState = { error?: string; ok?: boolean };
const str = (v: FormDataEntryValue | null, max: number) => String(v ?? "").trim().slice(0, max);

export async function createProject(_p: ProjState, fd: FormData): Promise<ProjState> {
  await requireRole("OWNER");
  const title = str(fd.get("title"), 120);
  if (!title) return { error: "Enter a project title." };
  const file = fd.get("photo");
  if (!(file instanceof File)) return { error: "Choose a photo." };
  let name: string;
  try { name = await saveImage(file); } catch (e) { return { error: (e as Error).message }; }
  db().prepare("INSERT INTO projects(title,client,category,photo) VALUES(?,?,?,?)").run(title, str(fd.get("client"), 120), str(fd.get("category"), 40), name);
  revalidatePath("/owner/projects");
  return { ok: true };
}

export async function deleteProject(fd: FormData) {
  await requireRole("OWNER");
  const id = Number(fd.get("id"));
  const p = db().prepare("SELECT photo FROM projects WHERE id=?").get(id) as { photo: string } | undefined;
  if (!p) return;
  db().prepare("DELETE FROM projects WHERE id=?").run(id);
  removeImage(p.photo);
  revalidatePath("/owner/projects");
}

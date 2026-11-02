// Everything a technician can read lives here. None of these queries select
// cost, markup, price or quote totals, so prices cannot reach a technician page.
import { db } from "./db";

export type TechJob = { id: number; client: string; address: string; client_phone: string; client_email: string; scope: string; status: string; created_at: string };
export type Mat = { id: number; name: string; unit: string; planned: number };

const COLS = "id,client,address,client_phone,client_email,scope,status,created_at";

export const listJobs = (techId: number) =>
  db().prepare(`SELECT ${COLS} FROM jobs WHERE tech_id=? ORDER BY (status='Open') DESC, id DESC`).all(techId) as TechJob[];

export function getJob(id: number, techId: number) {
  const job = db().prepare(`SELECT ${COLS} FROM jobs WHERE id=? AND tech_id=?`).get(id, techId) as TechJob | undefined;
  if (!job) return null;
  const mats = db().prepare("SELECT id,name,unit,planned FROM job_materials WHERE job_id=? ORDER BY id").all(id) as Mat[];
  return { job, mats };
}

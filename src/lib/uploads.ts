import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const uploadDir = () => process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
export const MIME = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" } as const;
export const NAME_RE = /^[a-f0-9]{32}\.(jpg|png|webp)$/;
const MAX = 5 * 1024 * 1024;

// The file type is decided from the file's own bytes, never from its name or the browser's claim.
function kind(b: Buffer): keyof typeof MIME | null {
  if (b.length > 12 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.length > 8 && b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.length > 12 && b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP") return "webp";
  return null;
}

export async function saveImage(file: File): Promise<string> {
  if (!file || file.size === 0) throw new Error("Choose a photo.");
  if (file.size > MAX) throw new Error("The photo is larger than 5 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const k = kind(buf);
  if (!k) throw new Error("Use a JPG, PNG or WebP photo.");
  const name = `${crypto.randomBytes(16).toString("hex")}.${k}`;
  fs.mkdirSync(uploadDir(), { recursive: true });
  fs.writeFileSync(path.join(uploadDir(), name), buf);
  return name;
}

export function removeImage(name: string) {
  if (NAME_RE.test(name)) fs.rmSync(path.join(uploadDir(), name), { force: true });
}

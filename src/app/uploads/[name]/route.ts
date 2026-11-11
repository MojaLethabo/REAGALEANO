import fs from "node:fs";
import path from "node:path";
import { MIME, NAME_RE, uploadDir } from "@/lib/uploads";

// Serves project photos. Only names we generated ourselves are accepted, so paths cannot escape the folder.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  if (!NAME_RE.test(name)) return new Response("Not found", { status: 404 });
  try {
    const buf = fs.readFileSync(path.join(uploadDir(), name));
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": MIME[name.split(".")[1] as keyof typeof MIME], "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

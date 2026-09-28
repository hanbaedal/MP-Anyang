import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const MAX_BYTES = 8 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function saveManageUpload(file: File): Promise<{ ok: true; src: string } | { ok: false; error: string }> {
  if (!file || file.size < 1) {
    return { ok: false, error: "사진 파일을 선택해 주세요." };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, error: "사진은 8MB 이하만 올릴 수 있습니다." };
  }
  const type = file.type;
  const ext = type === "image/png" ? "png" : type === "image/webp" ? "webp" : type === "image/gif" ? "gif" : "jpg";
  if (!ALLOWED.includes(type) && !file.name.match(/\.(jpe?g|png|webp|gif)$/i)) {
    return { ok: false, error: "JPG, PNG, WebP, GIF만 올릴 수 있습니다." };
  }
  const name = `${Date.now()}-${randomBytes(6).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buf);
  return { ok: true, src: `/uploads/${name}` };
}

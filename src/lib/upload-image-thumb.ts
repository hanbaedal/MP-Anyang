import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const THUMB_WIDTH = 720;

/** public/uploads 파일 옆에 public/uploads/thumbs 동일 파일명 JPEG 썸네일 생성 */
export async function writeUploadThumb(relativeSrc: string, originalBuffer: Buffer) {
  if (!relativeSrc.startsWith("/uploads/") || relativeSrc.includes("..")) return;
  const rel = relativeSrc.replace(/^\//, "");
  const thumbRel = rel.replace(/^uploads\//, "uploads/thumbs/").replace(/\.(png|webp|gif|jpe?g)$/i, ".jpg");
  const thumbDisk = path.join(process.cwd(), "public", thumbRel.replace(/\//g, path.sep));
  await mkdir(path.dirname(thumbDisk), { recursive: true });
  await sharp(originalBuffer)
    .rotate()
    .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile(thumbDisk);
}

export async function saveUploadImageWithThumb(
  name: string,
  buffer: Buffer,
): Promise<{ src: string; thumbSrc: string }> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const disk = path.join(dir, name);
  await writeFile(disk, buffer);
  const src = `/uploads/${name}`;
  try {
    await writeUploadThumb(src, buffer);
  } catch (error) {
    console.error("[upload-thumb] failed", error);
  }
  const thumbSrc = `/uploads/thumbs/${name.replace(/\.(png|webp|gif|jpe?g)$/i, ".jpg")}`;
  return { src, thumbSrc };
}

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { hasMongo } from "./mongo";
import { putUploadObject } from "./upload-store";

const THUMB_WIDTH = 720;

function thumbFileName(name: string) {
  return name.replace(/\.(png|webp|gif|jpe?g)$/i, ".jpg");
}

async function writeLocalThumb(relativeSrc: string, originalBuffer: Buffer) {
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
  const src = `/uploads/${name}`;
  const thumbName = thumbFileName(name);
  const thumbSrc = `/uploads/thumbs/${thumbName}`;
  const origKey = `uploads/${name}`;
  const thumbKey = `uploads/thumbs/${thumbName}`;

  if (hasMongo()) {
    await putUploadObject(origKey, buffer);
    try {
      const thumbBuffer = await sharp(buffer)
        .rotate()
        .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
        .jpeg({ quality: 72, mozjpeg: true })
        .toBuffer();
      await putUploadObject(thumbKey, thumbBuffer, "image/jpeg");
    } catch (error) {
      console.error("[upload-thumb] gridfs thumb failed", error);
    }
    return { src, thumbSrc };
  }

  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const disk = path.join(dir, name);
  await writeFile(disk, buffer);
  try {
    await writeLocalThumb(src, buffer);
  } catch (error) {
    console.error("[upload-thumb] local thumb failed", error);
  }
  return { src, thumbSrc };
}

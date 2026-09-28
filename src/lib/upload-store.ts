import { readFile } from "node:fs/promises";
import path from "node:path";
import { GridFSBucket } from "mongodb";
import { getDb, hasMongo } from "./mongo";

const BUCKET = "site_uploads";

function contentTypeFromKey(key: string) {
  const lower = key.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".m4a")) return "audio/mp4";
  if (lower.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
}

/** GridFS key, e.g. uploads/abc.jpg or uploads/thumbs/abc.jpg */
export function uploadStorageKey(relativePath: string) {
  const clean = relativePath.replace(/^\/+/, "").replace(/\.\./g, "");
  return clean.startsWith("uploads/") ? clean : `uploads/${clean}`;
}

export async function putUploadObject(key: string, buffer: Buffer, contentType?: string) {
  if (!hasMongo()) throw new Error("MongoDB가 설정되지 않았습니다.");
  const db = await getDb();
  if (!db) throw new Error("MongoDB에 연결하지 못했습니다.");
  const bucket = new GridFSBucket(db, { bucketName: BUCKET });
  const filename = uploadStorageKey(key);
  const existing = await bucket.find({ filename }).toArray();
  for (const file of existing) {
    await bucket.delete(file._id);
  }
  await new Promise<void>((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, {
      metadata: { contentType: contentType ?? contentTypeFromKey(filename) },
    });
    stream.on("finish", () => resolve());
    stream.on("error", reject);
    stream.end(buffer);
  });
}

export async function getUploadObject(key: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  if (!hasMongo()) return null;
  try {
    const db = await getDb();
    if (!db) return null;
    const bucket = new GridFSBucket(db, { bucketName: BUCKET });
    const filename = uploadStorageKey(key);
    const files = await bucket.find({ filename }).limit(1).toArray();
    if (!files.length) return null;
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      bucket
        .openDownloadStream(files[0]._id)
        .on("data", (chunk: Buffer) => chunks.push(chunk))
        .on("end", () => resolve())
        .on("error", reject);
    });
    const meta = files[0].metadata as { contentType?: string } | undefined;
    return {
      buffer: Buffer.concat(chunks),
      contentType: meta?.contentType || contentTypeFromKey(filename),
    };
  } catch (error) {
    console.error("[upload-store] gridfs read failed", error);
    return null;
  }
}

export async function readUploadFromDisk(relativePath: string): Promise<{ buffer: Buffer; contentType: string } | null> {
  const clean = relativePath.replace(/^\/+/, "").replace(/\.\./g, "");
  if (!clean.startsWith("uploads/")) return null;
  const disk = path.join(process.cwd(), "public", clean.replace(/\//g, path.sep));
  try {
    const buffer = await readFile(disk);
    return { buffer, contentType: contentTypeFromKey(clean) };
  } catch {
    return null;
  }
}

/** Serve path segments after /uploads/ or /api/uploads/ */
export async function resolveUploadRequest(pathSegments: string[]) {
  if (!pathSegments.length || pathSegments.some((p) => p.includes(".."))) return null;
  const rel = pathSegments.join("/");
  const key = uploadStorageKey(rel);
  const fromGrid = await getUploadObject(key);
  if (fromGrid) return fromGrid;
  return readUploadFromDisk(key);
}

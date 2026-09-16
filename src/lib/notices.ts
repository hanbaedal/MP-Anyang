import { readFile } from "node:fs/promises";
import path from "node:path";
import { getDb, hasMongo } from "./mongo";

export type Notice = {
  slug: string;
  title: string;
  body: string;
  publishedAt: string;
  pinned?: boolean;
};

function fromDoc(doc: Record<string, unknown>): Notice {
  const published =
    doc.publishedAt instanceof Date
      ? doc.publishedAt.toISOString()
      : String(doc.publishedAt ?? "");
  return {
    slug: String(doc.slug ?? ""),
    title: String(doc.title ?? ""),
    body: String(doc.body ?? ""),
    publishedAt: published,
    pinned: Boolean(doc.pinned),
  };
}

async function fromFile(): Promise<Notice[]> {
  const file = path.join(process.cwd(), "data", "notices.json");
  const raw = await readFile(file, "utf8");
  const parsed = JSON.parse(raw) as Notice[];
  return parsed.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.publishedAt.localeCompare(a.publishedAt));
}

export async function listNotices(): Promise<Notice[]> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const rows = await db
          .collection("notices")
          .find({})
          .sort({ pinned: -1, publishedAt: -1 })
          .toArray();
        if (rows.length) return rows.map((row) => fromDoc(row as Record<string, unknown>));
      }
    } catch (error) {
      console.error("[notices] mongo read failed, using file fallback", error);
    }
  }
  return fromFile();
}

export async function getNotice(slug: string): Promise<Notice | null> {
  const all = await listNotices();
  return all.find((item) => item.slug === slug) ?? null;
}

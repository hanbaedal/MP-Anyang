import { randomUUID } from "node:crypto";
import { GALLERY, type GalleryTag } from "./content";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  tags: GalleryTag[];
};

const localFile = dataFile("gallery.local.json");
const GALLERY_TAGS: GalleryTag[] = ["전경", "매장묘", "평장묘", "봉안묘", "리모델링"];

export function defaultGallery(): GalleryPhoto[] {
  return GALLERY.map((item, index) => ({
    id: `seed-${index + 1}`,
    src: item.src,
    alt: item.alt,
    tags: item.tags,
  }));
}

function fromDoc(doc: Record<string, unknown>): GalleryPhoto {
  const tags = Array.isArray(doc.tags)
    ? doc.tags.filter((tag): tag is GalleryTag => GALLERY_TAGS.includes(tag as GalleryTag))
    : [];
  return {
    id: String(doc.id ?? doc._id ?? ""),
    src: String(doc.src ?? ""),
    alt: String(doc.alt ?? ""),
    tags,
  };
}

async function readStored(): Promise<GalleryPhoto[] | null> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const rows = await db.collection("gallery").find({}).sort({ sort: 1, createdAt: 1 }).toArray();
        if (rows.length) return rows.map((row) => fromDoc(row as Record<string, unknown>));
        return null;
      }
    } catch (error) {
      console.error("[gallery] mongo read failed", error);
    }
  }
  const local = await readJsonFile<GalleryPhoto[] | null>(localFile, null);
  return local && local.length ? local : null;
}

export async function listGallery(): Promise<GalleryPhoto[]> {
  return (await readStored()) ?? defaultGallery();
}

async function persist(items: GalleryPhoto[]) {
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("gallery").deleteMany({});
    if (items.length) {
      await db.collection("gallery").insertMany(
        items.map((item, sort) => ({
          ...item,
          sort,
          createdAt: new Date(),
        })),
      );
    }
    return;
  }
  await writeJsonFile(localFile, items);
}

export async function addGalleryPhoto(input: { src: string; alt: string; tags: GalleryTag[] }) {
  const items = await listGallery();
  const photo: GalleryPhoto = {
    id: randomUUID(),
    src: input.src,
    alt: input.alt.trim() || "공원 사진",
    tags: input.tags.length ? input.tags : ["전경"],
  };
  items.push(photo);
  await persist(items);
  return photo;
}

export async function updateGalleryPhoto(id: string, input: { alt?: string; tags?: GalleryTag[] }) {
  const items = await listGallery();
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, error: "사진을 찾지 못했습니다." };
  items[idx] = {
    ...items[idx],
    alt: input.alt !== undefined ? input.alt.trim() : items[idx].alt,
    tags: input.tags ?? items[idx].tags,
  };
  await persist(items);
  return { ok: true as const, photo: items[idx] };
}

export async function deleteGalleryPhoto(id: string) {
  const items = await listGallery();
  const next = items.filter((item) => item.id !== id);
  if (next.length === items.length) return { ok: false as const, error: "사진을 찾지 못했습니다." };
  await persist(next);
  return { ok: true as const };
}

export { GALLERY_TAGS };

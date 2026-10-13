import { randomUUID } from "node:crypto";
import { GALLERY } from "./content";
import type { GalleryTag } from "./content";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { getDb, hasMongo } from "./mongo";
import { GALLERY_TAGS, type GalleryPhoto } from "./gallery-types";
import type { Locale } from "./i18n";
import { CONTENT_LOCALES, localizeStoredText, translateText, type ContentLocale } from "./translate-content";

export type { GalleryPhoto } from "./gallery-types";
export { GALLERY_TAGS } from "./gallery-types";

const localFile = dataFile("gallery.local.json");

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
    i18n: doc.i18n && typeof doc.i18n === "object" ? (doc.i18n as GalleryPhoto["i18n"]) : undefined,
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

export async function listGalleryLocalized(locale: Locale): Promise<GalleryPhoto[]> {
  return (await listGallery()).map((item) => {
    if (locale === "en" || locale === "zh") {
      const alt = item.i18n?.[locale]?.alt || localizeStoredText(item.alt, locale);
      return { ...item, alt };
    }
    return item;
  });
}

async function fillGalleryAltI18n(alt: string): Promise<GalleryPhoto["i18n"]> {
  const i18n: NonNullable<GalleryPhoto["i18n"]> = {};
  for (const to of CONTENT_LOCALES) {
    try {
      i18n[to] = { alt: await translateText(alt, to as ContentLocale) };
    } catch (error) {
      console.error(`[gallery] translate alt ${to} failed`, error);
    }
  }
  return i18n;
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
  const alt = input.alt.trim() || "공원 사진";
  const photo: GalleryPhoto = {
    id: randomUUID(),
    src: input.src,
    alt,
    tags: input.tags.length ? input.tags : ["일반"],
    i18n: await fillGalleryAltI18n(alt),
  };
  items.push(photo);
  await persist(items);
  return photo;
}

export async function updateGalleryPhoto(id: string, input: { alt?: string; tags?: GalleryTag[] }) {
  const items = await listGallery();
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, error: "사진을 찾지 못했습니다." };
  const alt = input.alt !== undefined ? input.alt.trim() : items[idx].alt;
  const altChanged = input.alt !== undefined && alt !== items[idx].alt;
  items[idx] = {
    ...items[idx],
    alt,
    tags: input.tags ?? items[idx].tags,
    i18n: altChanged ? await fillGalleryAltI18n(alt) : items[idx].i18n,
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

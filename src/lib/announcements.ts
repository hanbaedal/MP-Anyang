import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { isAnnouncementActive, type AnnouncementDismissScope, type SiteAnnouncement } from "./announcement-types";
import { isSafeHomeMediaPath } from "./home-hero";
import { getDb, hasMongo } from "./mongo";

export type { AnnouncementDismissScope, SiteAnnouncement } from "./announcement-types";

const localFile = dataFile("announcements.local.json");

function nowIso() {
  return new Date().toISOString();
}

function fromDoc(doc: Record<string, unknown>): SiteAnnouncement {
  return {
    id: String(doc.id ?? randomUUID()),
    title: String(doc.title ?? "").trim(),
    body: String(doc.body ?? ""),
    imageSrc: String(doc.imageSrc ?? ""),
    linkHref: String(doc.linkHref ?? "").trim(),
    linkLabel: String(doc.linkLabel ?? "").trim(),
    enabled: doc.enabled !== false,
    startsAt: doc.startsAt instanceof Date ? doc.startsAt.toISOString() : String(doc.startsAt ?? ""),
    endsAt: doc.endsAt instanceof Date ? doc.endsAt.toISOString() : String(doc.endsAt ?? ""),
    dismissScope: (["session", "day", "until_end"].includes(String(doc.dismissScope))
      ? doc.dismissScope
      : "day") as AnnouncementDismissScope,
    sortOrder: Number(doc.sortOrder ?? 0) || 0,
    createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : String(doc.createdAt ?? nowIso()),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? nowIso()),
  };
}

function normalize(input: Partial<SiteAnnouncement> & { id?: string }): SiteAnnouncement {
  const imageSrc = String(input.imageSrc ?? "").trim();
  return {
    id: input.id || randomUUID(),
    title: String(input.title ?? "").trim(),
    body: String(input.body ?? ""),
    imageSrc: imageSrc && isSafeHomeMediaPath(imageSrc) ? imageSrc : "",
    linkHref: String(input.linkHref ?? "").trim(),
    linkLabel: String(input.linkLabel ?? "").trim() || "자세히 보기",
    enabled: input.enabled !== false,
    startsAt: String(input.startsAt ?? ""),
    endsAt: String(input.endsAt ?? ""),
    dismissScope: input.dismissScope ?? "day",
    sortOrder: Number(input.sortOrder ?? 0) || 0,
    createdAt: input.createdAt ?? nowIso(),
    updatedAt: nowIso(),
  };
}

export { isAnnouncementActive } from "./announcement-types";

async function readLocal(): Promise<SiteAnnouncement[]> {
  return readJsonFile<SiteAnnouncement[]>(localFile, []);
}

async function writeAll(items: SiteAnnouncement[]) {
  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("site_announcements").deleteMany({});
    if (items.length) {
      await db.collection("site_announcements").insertMany(
        items.map((item) => ({
          ...item,
          startsAt: item.startsAt || "",
          endsAt: item.endsAt || "",
          updatedAt: new Date(item.updatedAt),
        })),
      );
    }
    return;
  }
  await writeJsonFile(localFile, items);
}

export async function listAnnouncements(): Promise<SiteAnnouncement[]> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const rows = await db.collection("site_announcements").find({}).sort({ sortOrder: 1, createdAt: -1 }).toArray();
        return rows.map((row) => fromDoc(row as Record<string, unknown>));
      }
    } catch (error) {
      console.error("[announcements] mongo read failed", error);
    }
  }
  return readLocal();
}

export async function listActiveAnnouncements(at = new Date()): Promise<SiteAnnouncement[]> {
  const all = await listAnnouncements();
  return all.filter((item) => isAnnouncementActive(item, at)).sort((a, b) => a.sortOrder - b.sortOrder || b.createdAt.localeCompare(a.createdAt));
}

function validateSchedule(startsAt: string, endsAt: string) {
  const startMs = startsAt.trim() ? new Date(startsAt.trim()).getTime() : null;
  const endMs = endsAt.trim() ? new Date(endsAt.trim()).getTime() : null;
  if (startMs !== null && Number.isNaN(startMs)) throw new Error("노출 시작 시각이 올바르지 않습니다.");
  if (endMs !== null && Number.isNaN(endMs)) throw new Error("노출 종료 시각이 올바르지 않습니다.");
  if (startMs !== null && endMs !== null && endMs < startMs) {
    throw new Error("노출 종료는 시작 시각 이후여야 합니다.");
  }
}

export async function saveAnnouncement(input: Partial<SiteAnnouncement> & { id?: string }): Promise<SiteAnnouncement> {
  const all = await listAnnouncements();
  const existing = input.id ? all.find((a) => a.id === input.id) : undefined;
  const item = normalize({ ...existing, ...input, id: input.id ?? existing?.id });
  if (!item.title) throw new Error("제목을 입력해 주세요.");
  validateSchedule(item.startsAt, item.endsAt);
  const idx = all.findIndex((a) => a.id === item.id);
  if (idx >= 0) {
    item.createdAt = all[idx].createdAt;
    all[idx] = item;
  } else {
    all.unshift(item);
  }
  await writeAll(all);
  return item;
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const all = await listAnnouncements();
  await writeAll(all.filter((a) => a.id !== id));
}

import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import type { HomeHeroAsset, HomeHeroSettings } from "./home-hero-types";
import { getDb, hasMongo } from "./mongo";

export type { HomeHeroAsset, HomeHeroSettings } from "./home-hero-types";

const localFile = dataFile("home-hero.local.json");
const SETTINGS_KEY = "home_hero";

export function defaultHomeHeroSettings(): HomeHeroSettings {
  const now = new Date().toISOString();
  const videos: HomeHeroAsset[] = [
    {
      id: "builtin-video",
      kind: "video",
      src: "/videos/home-hero.mp4",
      label: "기본 배포 영상",
      createdAt: now,
    },
  ];
  const audios: HomeHeroAsset[] = [
    {
      id: "builtin-audio",
      kind: "audio",
      src: "/audio/home-bgm.mp3",
      label: "기본 배포 음악",
      createdAt: now,
    },
  ];
  return {
    videoSrc: videos[0].src,
    audioSrc: audios[0].src,
    posterSrc: "/images/hero.jpg",
    videos,
    audios,
    updatedAt: now,
  };
}

export function isSafeHomeMediaPath(src: string) {
  if (!src.startsWith("/") || src.includes("..")) return false;
  return /^\/(videos|audio|uploads|images)\//.test(src);
}

function normalizeAsset(raw: unknown, kind: HomeHeroAsset["kind"]): HomeHeroAsset | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Record<string, unknown>;
  const src = String(row.src ?? "");
  if (!isSafeHomeMediaPath(src)) return null;
  return {
    id: String(row.id || randomUUID()),
    kind,
    src,
    label: String(row.label ?? "").trim() || (kind === "video" ? "영상" : "음악"),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? new Date().toISOString()),
  };
}

function fromDoc(doc: Record<string, unknown>): HomeHeroSettings {
  const base = defaultHomeHeroSettings();
  const videos = Array.isArray(doc.videos)
    ? doc.videos.map((item) => normalizeAsset(item, "video")).filter(Boolean)
    : base.videos;
  const audios = Array.isArray(doc.audios)
    ? doc.audios.map((item) => normalizeAsset(item, "audio")).filter(Boolean)
    : base.audios;
  const videoSrc = String(doc.videoSrc ?? base.videoSrc);
  const audioSrc = String(doc.audioSrc ?? base.audioSrc);
  const posterSrc = String(doc.posterSrc ?? base.posterSrc);
  return {
    videoSrc: isSafeHomeMediaPath(videoSrc) ? videoSrc : base.videoSrc,
    audioSrc: isSafeHomeMediaPath(audioSrc) ? audioSrc : base.audioSrc,
    posterSrc: isSafeHomeMediaPath(posterSrc) ? posterSrc : base.posterSrc,
    videos: videos.length ? (videos as HomeHeroAsset[]) : base.videos,
    audios: audios.length ? (audios as HomeHeroAsset[]) : base.audios,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? base.updatedAt),
  };
}

async function readLocal(): Promise<HomeHeroSettings | null> {
  return readJsonFile<HomeHeroSettings | null>(localFile, null);
}

export async function getHomeHeroSettings(): Promise<HomeHeroSettings> {
  if (hasMongo()) {
    try {
      const db = await getDb();
      if (db) {
        const row = await db.collection("site_settings").findOne({ key: SETTINGS_KEY });
        if (row) return fromDoc(row as Record<string, unknown>);
      }
    } catch (error) {
      console.error("[home-hero] mongo read failed", error);
    }
  }
  const local = await readLocal();
  return local ?? defaultHomeHeroSettings();
}

export async function saveHomeHeroSettings(input: HomeHeroSettings): Promise<HomeHeroSettings> {
  const settings: HomeHeroSettings = {
    ...input,
    videoSrc: isSafeHomeMediaPath(input.videoSrc) ? input.videoSrc : defaultHomeHeroSettings().videoSrc,
    audioSrc: isSafeHomeMediaPath(input.audioSrc) ? input.audioSrc : defaultHomeHeroSettings().audioSrc,
    posterSrc: isSafeHomeMediaPath(input.posterSrc) ? input.posterSrc : "/images/hero.jpg",
    videos: input.videos.filter((a) => a.kind === "video" && isSafeHomeMediaPath(a.src)),
    audios: input.audios.filter((a) => a.kind === "audio" && isSafeHomeMediaPath(a.src)),
    updatedAt: new Date().toISOString(),
  };

  if (hasMongo()) {
    const db = await getDb();
    if (!db) throw new Error("데이터베이스에 연결하지 못했습니다.");
    await db.collection("site_settings").updateOne(
      { key: SETTINGS_KEY },
      { $set: { ...settings, key: SETTINGS_KEY, updatedAt: new Date(settings.updatedAt) } },
      { upsert: true },
    );
    return settings;
  }

  await writeJsonFile(localFile, settings);
  return settings;
}

export function appendHomeHeroAsset(
  settings: HomeHeroSettings,
  asset: Omit<HomeHeroAsset, "id" | "createdAt"> & { id?: string },
): HomeHeroSettings {
  const entry: HomeHeroAsset = {
    id: asset.id ?? randomUUID(),
    kind: asset.kind,
    src: asset.src,
    label: asset.label.trim() || (asset.kind === "video" ? "영상" : "음악"),
    createdAt: new Date().toISOString(),
  };
  if (asset.kind === "video") {
    const exists = settings.videos.some((v) => v.src === entry.src);
    const videos = exists ? settings.videos : [entry, ...settings.videos];
    return { ...settings, videos, videoSrc: entry.src };
  }
  const exists = settings.audios.some((v) => v.src === entry.src);
  const audios = exists ? settings.audios : [entry, ...settings.audios];
  return { ...settings, audios, audioSrc: entry.src };
}

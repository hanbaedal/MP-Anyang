import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import { unlink } from "node:fs/promises";
import path from "node:path";
import type { HomeHeroAsset, HomeHeroSeasonTag, HomeHeroSettings } from "./home-hero-types";
import { HOME_HERO_SEASON_LABELS } from "./home-hero-types";
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
      season: "year_round",
      memo: "",
      createdAt: now,
    },
  ];
  const audios: HomeHeroAsset[] = [
    {
      id: "builtin-audio",
      kind: "audio",
      src: "/audio/home-bgm.mp3",
      label: "기본 배포 음악",
      season: "year_round",
      memo: "",
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
  return /^\/(videos|audio|uploads|api\/uploads|images)\//.test(src);
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
    season: parseSeason(row.season),
    memo: String(row.memo ?? "").trim(),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt ?? new Date().toISOString()),
  };
}

function parseSeason(raw: unknown): HomeHeroSeasonTag {
  const s = String(raw ?? "");
  if (s in HOME_HERO_SEASON_LABELS || s === "") return s as HomeHeroSeasonTag;
  return "";
}

export function isBuiltinHomeHeroAsset(id: string) {
  return id === "builtin-video" || id === "builtin-audio";
}

function pickFallbackSrc(list: HomeHeroAsset[], kind: HomeHeroAsset["kind"]) {
  const base = defaultHomeHeroSettings();
  return list[0]?.src ?? (kind === "video" ? base.videoSrc : base.audioSrc);
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
  const safeVideo = isSafeHomeMediaPath(videoSrc) ? videoSrc : base.videoSrc;
  const safeAudio = isSafeHomeMediaPath(audioSrc) ? audioSrc : base.audioSrc;
  const videoList = videos.length ? (videos as HomeHeroAsset[]) : base.videos;
  const audioList = audios.length ? (audios as HomeHeroAsset[]) : base.audios;
  return {
    videoSrc: videoList.some((v) => v.src === safeVideo) || safeVideo.startsWith("/videos/") ? safeVideo : base.videoSrc,
    audioSrc: audioList.some((a) => a.src === safeAudio) || safeAudio.startsWith("/audio/") ? safeAudio : base.audioSrc,
    posterSrc: isSafeHomeMediaPath(posterSrc) ? posterSrc : base.posterSrc,
    videos: videoList,
    audios: audioList,
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? base.updatedAt),
  };
}

async function readLocal(): Promise<HomeHeroSettings | null> {
  return readJsonFile<HomeHeroSettings | null>(localFile, null);
}

const HOME_HERO_READ_MS = 2_500;

async function readHomeHeroFromMongo(): Promise<HomeHeroSettings | null> {
  const db = await getDb();
  if (!db) return null;
  const row = await db.collection("site_settings").findOne({ key: SETTINGS_KEY });
  return row ? fromDoc(row as Record<string, unknown>) : null;
}

/** 홈 히어로 설정. Mongo가 느리면 기본값으로 빨리 내려 502·장시간 대기를 막는다. */
export async function getHomeHeroSettings(): Promise<HomeHeroSettings> {
  if (hasMongo()) {
    try {
      const fromMongo = await Promise.race([
        readHomeHeroFromMongo(),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), HOME_HERO_READ_MS);
        }),
      ]);
      if (fromMongo) return fromMongo;
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
  options?: { applyPublic?: boolean },
): HomeHeroSettings {
  const applyPublic = options?.applyPublic !== false;
  const entry: HomeHeroAsset = {
    id: asset.id ?? randomUUID(),
    kind: asset.kind,
    src: asset.src,
    label: asset.label.trim() || (asset.kind === "video" ? "영상" : "음악"),
    season: asset.season ?? "",
    memo: asset.memo?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  if (asset.kind === "video") {
    const exists = settings.videos.some((v) => v.src === entry.src);
    const videos = exists ? settings.videos : [entry, ...settings.videos];
    return { ...settings, videos, videoSrc: applyPublic ? entry.src : settings.videoSrc };
  }
  const exists = settings.audios.some((v) => v.src === entry.src);
  const audios = exists ? settings.audios : [entry, ...settings.audios];
  return { ...settings, audios, audioSrc: applyPublic ? entry.src : settings.audioSrc };
}

export function updateHomeHeroAsset(
  settings: HomeHeroSettings,
  kind: HomeHeroAsset["kind"],
  id: string,
  patch: { label?: string; season?: HomeHeroSeasonTag; memo?: string },
): HomeHeroSettings | { error: string } {
  const listKey = kind === "video" ? "videos" : "audios";
  const list = settings[listKey];
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return { error: "항목을 찾을 수 없습니다." };
  const next = [...list];
  next[idx] = {
    ...next[idx],
    label: patch.label !== undefined ? patch.label.trim() || next[idx].label : next[idx].label,
    season: patch.season !== undefined ? parseSeason(patch.season) : next[idx].season,
    memo: patch.memo !== undefined ? patch.memo.trim() : next[idx].memo,
  };
  return { ...settings, [listKey]: next };
}

export function replaceHomeHeroAssetFile(
  settings: HomeHeroSettings,
  kind: HomeHeroAsset["kind"],
  id: string,
  newSrc: string,
): HomeHeroSettings | { error: string } {
  const listKey = kind === "video" ? "videos" : "audios";
  const list = settings[listKey];
  const idx = list.findIndex((a) => a.id === id);
  if (idx < 0) return { error: "항목을 찾을 수 없습니다." };
  if (isBuiltinHomeHeroAsset(id)) return { error: "기본 배포 파일은 교체할 수 없습니다. 새로 올려 주세요." };
  const oldSrc = list[idx].src;
  const next = [...list];
  next[idx] = { ...next[idx], src: newSrc };
  const activeKey = kind === "video" ? "videoSrc" : "audioSrc";
  const activeSrc = settings[activeKey] === oldSrc ? newSrc : settings[activeKey];
  return { ...settings, [listKey]: next, [activeKey]: activeSrc };
}

export async function deleteHomeHeroAsset(
  settings: HomeHeroSettings,
  kind: HomeHeroAsset["kind"],
  id: string,
): Promise<HomeHeroSettings | { error: string }> {
  if (isBuiltinHomeHeroAsset(id)) {
    return { error: "기본 배포 항목은 삭제할 수 없습니다." };
  }
  const listKey = kind === "video" ? "videos" : "audios";
  const list = settings[listKey];
  const target = list.find((a) => a.id === id);
  if (!target) return { error: "항목을 찾을 수 없습니다." };
  const nextList = list.filter((a) => a.id !== id);
  if (!nextList.length) return { error: "마지막 항목은 삭제할 수 없습니다." };
  const activeKey = kind === "video" ? "videoSrc" : "audioSrc";
  const nextActive = settings[activeKey] === target.src ? pickFallbackSrc(nextList, kind) : settings[activeKey];
  if (target.src.startsWith("/uploads/home-hero/")) {
    const disk = path.join(process.cwd(), "public", target.src.replace(/^\//, "").replace(/\//g, path.sep));
    await unlink(disk).catch(() => {});
  }
  return { ...settings, [listKey]: nextList, [activeKey]: nextActive };
}

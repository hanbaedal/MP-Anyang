import { randomUUID } from "node:crypto";
import { dataFile, readJsonFile, writeJsonFile } from "./local-json";
import type { HomeHeroAsset, HomeHeroSeasonTag, HomeHeroSettings } from "./home-hero-types";
import { HOME_HERO_SEASON_LABELS } from "./home-hero-types";
import { getDb, hasMongo } from "./mongo";
import { deleteUploadObject } from "./upload-store";

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

function slotAsset(
  kind: HomeHeroAsset["kind"],
  src: string,
  label: string,
  existing?: HomeHeroAsset | null,
): HomeHeroAsset {
  return {
    id: kind === "video" ? "slot-video" : "slot-audio",
    kind,
    src,
    label: label.trim() || existing?.label || (kind === "video" ? "영상" : "음악"),
    season: existing?.season ?? "year_round",
    memo: existing?.memo ?? "",
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  };
}

/** 영상 슬롯 1개. 음악은 경로가 있을 때만 1개(없으면 공란). */
function toSingleSlots(settings: HomeHeroSettings): HomeHeroSettings {
  const base = defaultHomeHeroSettings();
  const videoSrc = isSafeHomeMediaPath(settings.videoSrc) ? settings.videoSrc : base.videoSrc;
  const audioBlank = !settings.audioSrc;
  const audioSrc = audioBlank
    ? ""
    : isSafeHomeMediaPath(settings.audioSrc)
      ? settings.audioSrc
      : "";
  const video =
    settings.videos.find((v) => v.src === videoSrc) ||
    settings.videos[0] ||
    base.videos[0]!;
  const audio = audioSrc
    ? settings.audios.find((a) => a.src === audioSrc) ||
      settings.audios[0] ||
      null
    : null;
  return {
    ...settings,
    videoSrc,
    audioSrc,
    posterSrc: isSafeHomeMediaPath(settings.posterSrc) ? settings.posterSrc : base.posterSrc,
    videos: [slotAsset("video", videoSrc, video.label, video)],
    audios: audioSrc ? [slotAsset("audio", audioSrc, audio?.label || "음악", audio)] : [],
  };
}

function fromDoc(doc: Record<string, unknown>): HomeHeroSettings {
  const base = defaultHomeHeroSettings();
  const videos = Array.isArray(doc.videos)
    ? (doc.videos.map((item) => normalizeAsset(item, "video")).filter(Boolean) as HomeHeroAsset[])
    : base.videos;
  const audios = Array.isArray(doc.audios)
    ? (doc.audios.map((item) => normalizeAsset(item, "audio")).filter(Boolean) as HomeHeroAsset[])
    : base.audios;
  const videoSrc = String(doc.videoSrc ?? base.videoSrc);
  const rawAudio = doc.audioSrc;
  const audioSrc =
    rawAudio === "" || rawAudio === null || rawAudio === undefined
      ? ""
      : String(rawAudio);
  const posterSrc = String(doc.posterSrc ?? base.posterSrc);
  const safeVideo = isSafeHomeMediaPath(videoSrc) ? videoSrc : base.videoSrc;
  const safeAudio = audioSrc === "" ? "" : isSafeHomeMediaPath(audioSrc) ? audioSrc : "";
  return toSingleSlots({
    videoSrc: safeVideo,
    audioSrc: safeAudio,
    posterSrc: isSafeHomeMediaPath(posterSrc) ? posterSrc : base.posterSrc,
    videos: videos.length ? videos : base.videos,
    audios: audios.length ? audios : [],
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : String(doc.updatedAt ?? base.updatedAt),
  });
}

export async function removeHomeHeroUploadFile(src: string) {
  if (!src.startsWith("/uploads/home-hero/") && !src.startsWith("/api/uploads/home-hero/")) return;
  const key = src.replace(/^\/api\//, "").replace(/^\//, "");
  await deleteUploadObject(key);
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
  return toSingleSlots(local ?? defaultHomeHeroSettings());
}

export async function saveHomeHeroSettings(input: HomeHeroSettings): Promise<HomeHeroSettings> {
  const settings = toSingleSlots({
    ...input,
    videoSrc: isSafeHomeMediaPath(input.videoSrc) ? input.videoSrc : defaultHomeHeroSettings().videoSrc,
    audioSrc: input.audioSrc === "" ? "" : isSafeHomeMediaPath(input.audioSrc) ? input.audioSrc : "",
    posterSrc: isSafeHomeMediaPath(input.posterSrc) ? input.posterSrc : "/images/hero.jpg",
    videos: input.videos.filter((a) => a.kind === "video" && isSafeHomeMediaPath(a.src)),
    audios: input.audios.filter((a) => a.kind === "audio" && isSafeHomeMediaPath(a.src)),
    updatedAt: new Date().toISOString(),
  });

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

/**
 * 저장 시 기존 영상·음악 업로드를 지우고 새로 등록한 값으로 덮어쓴다.
 * 음악 미등록이면 audioSrc 공란(영상에 사운드가 있는 경우).
 */
export async function commitHomeHeroSlots(
  settings: HomeHeroSettings,
  next: { videoSrc: string; audioSrc: string; videoLabel?: string; audioLabel?: string },
): Promise<HomeHeroSettings> {
  if (!next.videoSrc || !isSafeHomeMediaPath(next.videoSrc)) {
    throw new Error("영상을 등록한 뒤 저장해 주세요.");
  }
  if (next.audioSrc && !isSafeHomeMediaPath(next.audioSrc)) {
    throw new Error("음악 파일 경로가 올바르지 않습니다.");
  }

  const oldVideos = settings.videos;
  const oldAudios = settings.audios;

  // 이전 슬롯 파일은 전부 삭제(새 경로와 같아도 업로드가 덮어씀)
  for (const asset of oldVideos) await removeHomeHeroUploadFile(asset.src);
  for (const asset of oldAudios) await removeHomeHeroUploadFile(asset.src);

  const videoLabel = next.videoLabel?.trim() || "영상";
  const audioLabel = next.audioLabel?.trim() || "음악";
  const hasAudio = Boolean(next.audioSrc);

  return saveHomeHeroSettings({
    ...settings,
    videoSrc: next.videoSrc,
    audioSrc: hasAudio ? next.audioSrc : "",
    videos: [slotAsset("video", next.videoSrc, videoLabel, null)],
    audios: hasAudio ? [slotAsset("audio", next.audioSrc, audioLabel, null)] : [],
  });
}

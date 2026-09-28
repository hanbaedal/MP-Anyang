export type HomeHeroAssetKind = "video" | "audio";

/** 관리 화면·목록 정렬용 (예: 봄·여름·2026 설) */
export type HomeHeroSeasonTag = "spring" | "summer" | "autumn" | "winter" | "year_round" | "";

export type HomeHeroAsset = {
  id: string;
  kind: HomeHeroAssetKind;
  src: string;
  label: string;
  /** 계절·메모 (DB에 함께 저장) */
  season: HomeHeroSeasonTag;
  memo: string;
  createdAt: string;
};

export const HOME_HERO_SEASON_LABELS: Record<Exclude<HomeHeroSeasonTag, "">, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
  year_round: "사계절·상시",
};

export type HomeHeroSettings = {
  videoSrc: string;
  audioSrc: string;
  posterSrc: string;
  videos: HomeHeroAsset[];
  audios: HomeHeroAsset[];
  updatedAt: string;
};

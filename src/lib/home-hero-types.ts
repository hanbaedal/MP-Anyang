export type HomeHeroAssetKind = "video" | "audio";

export type HomeHeroAsset = {
  id: string;
  kind: HomeHeroAssetKind;
  src: string;
  label: string;
  createdAt: string;
};

export type HomeHeroSettings = {
  videoSrc: string;
  audioSrc: string;
  posterSrc: string;
  videos: HomeHeroAsset[];
  audios: HomeHeroAsset[];
  updatedAt: string;
};

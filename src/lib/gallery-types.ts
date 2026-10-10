import type { GalleryTag } from "./content";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  tags: GalleryTag[];
};

export const GALLERY_TAGS: GalleryTag[] = ["전경", "매장묘", "평장묘", "봉안묘", "리모델링"];

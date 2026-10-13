import type { GalleryTag } from "./content";

export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  tags: GalleryTag[];
  /** 손님용 영어·중국어 설명. 한글 alt는 위 필드. */
  i18n?: Partial<Record<"en" | "zh", { alt: string }>>;
};

export const GALLERY_TAGS: GalleryTag[] = ["일반", "전경", "매장묘", "평장묘", "봉안묘", "리모델링"];

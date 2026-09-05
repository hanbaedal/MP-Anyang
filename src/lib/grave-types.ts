const TYPE_IMAGES: Record<string, { src: string; alt: string }> = {
  봉안묘: { src: "/images/lot-columbarium.png", alt: "봉안묘" },
  수목장: { src: "/images/lot-tree.png", alt: "수목장" },
  매장묘: { src: "/images/lot-burial.png", alt: "매장묘" },
  평장묘: { src: "/images/lot-flat.png", alt: "평장묘" },
};

export function getGraveTypeImage(type: string) {
  return TYPE_IMAGES[type] || TYPE_IMAGES["봉안묘"];
}

/** Gallery/product image paths. Git stores paths only; files stay in public/ unless IMAGE_CDN_BASE is set. */

/** PPT·구 CMS에 남은 저해상도 경로 → 저장소 내 더 큰 원본 */
const IMAGE_UPGRADES: Record<string, string> = {
  "/images/lawn-2.jpg": "/images/lawn.jpg",
  "/images/columbarium-2.jpg": "/images/columbarium-3.jpg",
  "/images/remodel.jpg": "/images/remodel-3.jpg",
  "/images/gallery-4.jpg": "/images/plots.jpg",
};

export function resolveImagePath(path: string) {
  if (!path) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return IMAGE_UPGRADES[normalized] || normalized;
}

export function imageCdnBase() {
  return (process.env.NEXT_PUBLIC_IMAGE_CDN_BASE || process.env.IMAGE_CDN_BASE || "").replace(/\/$/, "");
}

export function mediaUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = resolveImagePath(path);
  const base = imageCdnBase();
  return base ? `${base}${normalized}` : normalized;
}

/** Small thumbnail for 둘러보기 grids. Originals stay at the same folder for lightbox. */
export function thumbUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = resolveImagePath(path);
  if (normalized.startsWith("/uploads/")) return mediaUrl(normalized);
  const thumb = normalized.replace(/^\/images\//, "/images/thumbs/");
  return mediaUrl(thumb === normalized ? normalized : thumb);
}

/** Gallery/product image paths. Git stores paths only; files stay in public/ unless IMAGE_CDN_BASE is set. */

export function imageCdnBase() {
  return (process.env.NEXT_PUBLIC_IMAGE_CDN_BASE || process.env.IMAGE_CDN_BASE || "").replace(/\/$/, "");
}

export function mediaUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const base = imageCdnBase();
  return base ? `${base}${normalized}` : normalized;
}

/** Small thumbnail for 둘러보기 grids. Originals stay at the same folder for lightbox. */
export function thumbUrl(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const thumb = normalized.replace(/^\/images\//, "/images/thumbs/");
  return mediaUrl(thumb === normalized ? normalized : thumb);
}

export const CMS_SLUGS = [
  { slug: "greeting", label: "인사말" },
  { slug: "features", label: "공원 특징" },
  { slug: "burial", label: "매장묘" },
  { slug: "lawn", label: "평장묘" },
  { slug: "columbarium", label: "봉안묘" },
  { slug: "remodeling", label: "리모델링" },
  { slug: "prices", label: "분양가·잔여" },
] as const;

export type CmsSlug = (typeof CMS_SLUGS)[number]["slug"];

export type CmsItem = {
  id: string;
  title: string;
  text?: string;
  image?: string;
  won?: string;
  remaining?: string;
};

export type CmsPage = {
  slug: CmsSlug;
  title: string;
  lead: string;
  body: string;
  items: CmsItem[];
  updatedAt: string;
};

export function isCmsSlug(value: string): value is CmsSlug {
  return CMS_SLUGS.some((item) => item.slug === value);
}

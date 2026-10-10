export const CMS_SLUGS = [
  { slug: "greeting", label: "인사말", i18n: "nav.greeting" },
  { slug: "features", label: "공원 특징", i18n: "nav.features" },
  { slug: "burial", label: "매장묘", i18n: "nav.burial" },
  { slug: "lawn", label: "평장묘", i18n: "nav.lawn" },
  { slug: "columbarium", label: "봉안묘", i18n: "nav.columbarium" },
  { slug: "remodeling", label: "리모델링", i18n: "nav.remodel" },
  { slug: "prices", label: "분양가·잔여", i18n: "nav.prices" },
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

export type CmsLocaleFields = {
  title: string;
  lead: string;
  body: string;
  items: CmsItem[];
};

export type CmsPage = {
  slug: CmsSlug;
  title: string;
  lead: string;
  body: string;
  items: CmsItem[];
  updatedAt: string;
  /** 손님용 영어·중국어 본문. 한글은 위 필드. */
  i18n?: Partial<Record<"en" | "zh", CmsLocaleFields>>;
};

export function isCmsSlug(value: string): value is CmsSlug {
  return CMS_SLUGS.some((item) => item.slug === value);
}

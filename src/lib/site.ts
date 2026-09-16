export const SITE = {
  legalName: "(재)안양공원묘원",
  shortName: "안양공원",
  phone: "031-482-2949",
  phoneTel: "tel:031-482-2949",
  visitName: "공동묘지관리소",
  address: "경기 안산시 상록구 버대길 195",
  addressLine: "경기 안산시 상록구 버대길 195",
  addressAlt: "경기 안산시 상록구 오리골길 41 (양상동 산50)",
  addressDetail: "양상동",
  region: "안산 상록구 양상동",
  postalCode: "15208",
  lat: 37.3521505,
  lng: 126.8419504,
  heroLine: "수도권 최상·최선·최고·최대, 접근성이 뛰어난 명당자리 (재)안양공원묘원",
  description:
    "경기 안산시 상록구 양상동 공동묘지관리소·(재)안양공원묘원. 매장·평장·봉안, 분양가 10% 계약, 관리비·회원·묻고답하기·벌초 신청.",
} as const;

export const DEFAULT_SITE_URL = "https://mp-anyang.onrender.com";

/** 소셜 URL. 값이 생기면 여기 또는 환경변수에 넣고, 비어 있으면 홈 버튼은 기존 안내 경로를 씁니다. 지어낸 주소는 넣지 않습니다. */
export const SOCIAL_URLS = {
  FACEBOOK: "",
  INSTAGRAM: "",
  YOUTUBE: "",
  CAFE: "",
} as const;

export type SocialKey = keyof typeof SOCIAL_URLS;

export function socialHref(key: SocialKey, fallback: string) {
  const fromEnv = process.env[`NEXT_PUBLIC_${key}_URL`]?.trim() || process.env[`${key}_URL`]?.trim();
  const fromConfig = SOCIAL_URLS[key].trim();
  return fromEnv || fromConfig || fallback;
}

export function siteUrl() {
  const raw = process.env.SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

export function metadataBase() {
  const url = siteUrl();
  return url ? new URL(url) : undefined;
}

export const MAP = {
  placeName: SITE.visitName,
  naverSearch: `https://map.naver.com/p/search/${encodeURIComponent(SITE.visitName + " " + SITE.addressLine)}`,
  naverDirections: `https://map.naver.com/p/directions/-/-/${SITE.lng},${SITE.lat},${encodeURIComponent(SITE.visitName)}/car`,
  kakaoSearch: `https://map.kakao.com/?q=${encodeURIComponent(SITE.addressLine)}`,
  kakaoDirections: `https://map.kakao.com/link/to/${encodeURIComponent(SITE.visitName)},${SITE.lat},${SITE.lng}`,
  osmEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${SITE.lng - 0.012}%2C${SITE.lat - 0.008}%2C${SITE.lng + 0.012}%2C${SITE.lat + 0.008}&layer=mapnik&marker=${SITE.lat}%2C${SITE.lng}`,
};

export type NavTone = "home" | "intro" | "lots" | "guide" | "gallery" | "support" | "more";
export type NavChild = { href: string; label: string; i18n: string; hint?: string };
export type NavItem = {
  href: string;
  label: string;
  i18n: string;
  tone: NavTone;
  image?: string;
  children?: NavChild[];
};

export const NAV_TONE_CLASS: Record<NavTone, string> = {
  home: "bg-[#eef3e8] hover:bg-[#e3eadc] border-[#d5e0c8]",
  intro: "bg-[#e7f3ee] hover:bg-[#d9ebe3] border-[#c5ddd3]",
  lots: "bg-[#f8eedd] hover:bg-[#f0e2c9] border-[#ead7b4]",
  guide: "bg-[#e7eef8] hover:bg-[#d7e3f3] border-[#c4d4ea]",
  gallery: "bg-[#eee8f7] hover:bg-[#e3daf0] border-[#d4c8e6]",
  support: "bg-[#f8e8e6] hover:bg-[#f0d9d5] border-[#e6c9c4]",
  more: "bg-[#e8f3f1] hover:bg-[#d7eae6] border-[#c3ddd8]",
};

export type SitemapMenu = {
  href: string;
  i18n: string;
  tone: NavTone;
  image: string;
  children: NavChild[];
};

export function sitemapMenus(): SitemapMenu[] {
  const menus: SitemapMenu[] = [
    { href: "/", i18n: "home", tone: "home", image: "/images/hero.jpg", children: [] },
  ];
  for (const item of NAV) {
    if (!item.children?.length) continue;
    menus.push({
      href: item.href,
      i18n: item.i18n,
      tone: item.tone,
      image: item.image || "/images/park-overview.jpg",
      children: item.children,
    });
  }
  return menus;
}

export const NAV: NavItem[] = [
  {
    href: "/intro/greeting",
    label: "공원소개",
    i18n: "nav.intro",
    tone: "intro",
    image: "/images/park-overview.jpg",
    children: [
      { href: "/intro/greeting", label: "인사말", i18n: "nav.greeting" },
      { href: "/intro/features", label: "공원 특징", i18n: "nav.features" },
      { href: "/intro/directions", label: "오시는 길", i18n: "nav.directions" },
    ],
  },
  {
    href: "/lots/burial",
    label: "분양안내",
    i18n: "nav.lots",
    tone: "lots",
    image: "/images/plots.jpg",
    children: [
      { href: "/lots/burial", label: "매장묘", i18n: "nav.burial" },
      { href: "/lots/lawn", label: "평장묘", i18n: "nav.lawn" },
      { href: "/lots/columbarium", label: "봉안묘", i18n: "nav.columbarium" },
      { href: "/lots/remodeling", label: "리모델링", i18n: "nav.remodel" },
      { href: "/lots/prices", label: "분양가·잔여", i18n: "nav.prices" },
    ],
  },
  {
    href: "/guide/procedure",
    label: "이용안내",
    i18n: "nav.guide",
    tone: "guide",
    image: "/images/lawn.jpg",
    children: [
      { href: "/guide/procedure", label: "분양 절차", i18n: "nav.procedure" },
      { href: "/guide/fees", label: "관리비", i18n: "nav.fees" },
      { href: "/guide/services", label: "서비스", i18n: "nav.services" },
      { href: "/guide/funeral", label: "장례·안치", i18n: "nav.funeral" },
    ],
  },
  {
    href: "/gallery",
    label: "둘러보기",
    i18n: "nav.gallery",
    tone: "gallery",
    image: "/images/gallery-mound.jpg",
    children: [{ href: "/gallery", label: "공원 갤러리", i18n: "gallery.title" }],
  },
  {
    href: "/support/notices",
    label: "고객센터",
    i18n: "nav.support",
    tone: "support",
    image: "/images/gallery-4.jpg",
    children: [
      { href: "/support/notices", label: "공지사항", i18n: "nav.notices" },
      { href: "/support/inquiry", label: "문의·상담", i18n: "nav.inquiry" },
      { href: "/support/faq", label: "묻고답하기", i18n: "nav.faq" },
    ],
  },
  {
    href: "/sitemap",
    label: "사이트맵",
    i18n: "nav.sitemap",
    tone: "more",
  },
];

export const SALE_STEPS = [
  { n: "1", titleKey: "step.1.title", textKey: "step.1.text" },
  { n: "2", titleKey: "step.2.title", textKey: "step.2.text" },
  { n: "3", titleKey: "step.3.title", textKey: "step.3.text" },
  { n: "4", titleKey: "step.4.title", textKey: "step.4.text" },
  { n: "5", titleKey: "step.5.title", textKey: "step.5.text" },
] as const;

export const FEATURES = [
  { titleKey: "feature.1.title", bodyKey: "feature.1.body" },
  { titleKey: "feature.2.title", bodyKey: "feature.2.body" },
  { titleKey: "feature.3.title", bodyKey: "feature.3.body" },
  { titleKey: "feature.4.title", bodyKey: "feature.4.body" },
] as const;

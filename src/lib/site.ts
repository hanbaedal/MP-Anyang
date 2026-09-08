import type { Locale } from "./i18n";

/** 보건복지부 공공데이터 기준 재단 연락처·위치 (공식 한글 표기) */
export const SITE = {
  legalName: "(재)안양공원묘원",
  shortName: "안양공원묘원",
  englishName: "ANYANG MEMORIAL PARK",
  slogan: "추억과 그리움이 머무는 자리, 안양공원묘원",
  region: "경기도 안산시",
  address: "경기도 안산시 상록구 오리골길 41 (양상동, 공동묘지관리소)",
  addressShort: "경기도 안산시 상록구 오리골길 41",
  phone: "031-482-2949",
  hours: "매일 08:00–18:00 (동절기 08:00–17:30)",
  hoursDisplay: "매일 08:00 – 18:00 (동절기 08:00 – 17:30)",
  parking: "미보유",
  type: "사설",
  prices: {
    saleLabel: "사용료",
    saleItem: "평당 · 1평",
    saleAmount: 798_700,
    annualLabel: "관리비",
    annualItem: "년간 · 평당",
    annualAmount: 11_000,
    asOf: "2023년 6월 1일",
    source: "재단법인 한국장례문화진흥원 — 전국 장사시설 현황 시설·가격정보",
  },
} as const;

export type SiteDisplay = {
  shortName: string;
  legalName: string;
  address: string;
  addressShort: string;
  hours: string;
  hoursDisplay: string;
  saleLabel: string;
  saleItem: string;
  annualLabel: string;
  annualItem: string;
  asOf: string;
  source: string;
};

const SITE_DISPLAY: Record<Locale, SiteDisplay> = {
  ko: {
    shortName: SITE.shortName,
    legalName: SITE.legalName,
    address: SITE.address,
    addressShort: SITE.addressShort,
    hours: SITE.hours,
    hoursDisplay: SITE.hoursDisplay,
    saleLabel: SITE.prices.saleLabel,
    saleItem: SITE.prices.saleItem,
    annualLabel: SITE.prices.annualLabel,
    annualItem: SITE.prices.annualItem,
    asOf: SITE.prices.asOf,
    source: SITE.prices.source,
  },
  en: {
    shortName: "Anyang Memorial Park",
    legalName: "Anyang Memorial Park Foundation",
    address: "41 Origol-gil, Sangnok-gu, Ansan-si, Gyeonggi-do (Yangsang-dong, Cemetery Management Office)",
    addressShort: "41 Origol-gil, Sangnok-gu, Ansan-si, Gyeonggi-do",
    hours: "Daily 08:00–18:00 (winter 08:00–17:30)",
    hoursDisplay: "Daily 08:00 – 18:00 (winter 08:00 – 17:30)",
    saleLabel: "Usage fee",
    saleItem: "Per pyeong · 1 pyeong",
    annualLabel: "Maintenance",
    annualItem: "Yearly · per pyeong",
    asOf: "June 1, 2023",
    source: "Korea Funeral Culture Promotion Foundation — nationwide funeral facility status and prices",
  },
  zh: {
    shortName: "安养公园墓园",
    legalName: "（财）安养公园墓园",
    address: "京畿道安山市常绿区梧里谷路41（阳上洞，共同墓地管理所）",
    addressShort: "京畿道安山市常绿区梧里谷路41",
    hours: "每日 08:00–18:00（冬季 08:00–17:30）",
    hoursDisplay: "每日 08:00 – 18:00（冬季 08:00 – 17:30）",
    saleLabel: "使用费",
    saleItem: "每坪 · 1坪",
    annualLabel: "管理费",
    annualItem: "每年 · 每坪",
    asOf: "2023年6月1日",
    source: "财团法人韩国葬礼文化振兴院 — 全国葬事设施现况·价格信息",
  },
  ja: {
    shortName: "安養公園墓園",
    legalName: "（財）安養公園墓園",
    address: "京畿道安山市常緑区オリゴルギル41（陽上洞、共同墓地管理所）",
    addressShort: "京畿道安山市常緑区オリゴルギル41",
    hours: "毎日 08:00–18:00（冬期 08:00–17:30）",
    hoursDisplay: "毎日 08:00 – 18:00（冬期 08:00 – 17:30）",
    saleLabel: "使用料",
    saleItem: "坪当たり · 1坪",
    annualLabel: "管理費",
    annualItem: "年間 · 坪当たり",
    asOf: "2023年6月1日",
    source: "財団法人韓国葬儀文化振興院 — 全国葬祭施設現況・価格情報",
  },
};

export function siteDisplay(locale: Locale): SiteDisplay {
  return SITE_DISPLAY[locale] ?? SITE_DISPLAY.ko;
}

export function telHref(phone = SITE.phone) {
  return `tel:${phone.replace(/-/g, "")}`;
}

export const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.addressShort)}&output=embed`;

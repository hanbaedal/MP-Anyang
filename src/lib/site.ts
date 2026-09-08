/** 보건복지부 공공데이터 기준 재단 연락처·위치 */
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

export function telHref(phone = SITE.phone) {
  return `tel:${phone.replace(/-/g, "")}`;
}

export const MAP_EMBED_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(SITE.addressShort)}&output=embed`;

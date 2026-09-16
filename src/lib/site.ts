export const SITE = {
  legalName: "(재)안양공원묘원",
  shortName: "안양공원",
  phone: "031-482-2949",
  phoneTel: "tel:031-482-2949",
  address: "경기 안산시 상록구 오리골길 41 (양상동 산50)",
  addressLine: "경기 안산시 상록구 오리골길 41",
  addressDetail: "양상동 산50",
  region: "안산 상록구 양상동",
  postalCode: "15208",
  lat: 37.3521505,
  lng: 126.8419504,
  heroLine: "수도권 서남부, 고인을 편안하게 모시는 (재)안양공원묘원",
  description:
    "경기 안산시 상록구 양상동에 있는 (재)안양공원묘원. 매장묘·평장묘·봉안묘 안내, 청약서 분양 절차, 관리비·리모델링·이장·개장 안내.",
} as const;

export function siteUrl() {
  const raw = process.env.SITE_URL?.trim();
  if (!raw) return "";
  return raw.replace(/\/$/, "");
}

export function metadataBase() {
  const url = siteUrl();
  return url ? new URL(url) : undefined;
}

export const MAP = {
  naverSearch: `https://map.naver.com/p/search/${encodeURIComponent(SITE.addressLine)}`,
  naverDirections: `https://map.naver.com/p/directions/-/-/${SITE.lng},${SITE.lat},${encodeURIComponent(SITE.legalName)}/car`,
  kakaoSearch: `https://map.kakao.com/?q=${encodeURIComponent(SITE.addressLine)}`,
  kakaoDirections: `https://map.kakao.com/link/to/${encodeURIComponent(SITE.legalName)},${SITE.lat},${SITE.lng}`,
  osmEmbed: `https://www.openstreetmap.org/export/embed.html?bbox=${SITE.lng - 0.012}%2C${SITE.lat - 0.008}%2C${SITE.lng + 0.012}%2C${SITE.lat + 0.008}&layer=mapnik&marker=${SITE.lat}%2C${SITE.lng}`,
};

export type NavChild = { href: string; label: string; hint?: string };
export type NavItem = { href: string; label: string; children?: NavChild[] };

export const NAV: NavItem[] = [
  {
    href: "/intro/greeting",
    label: "공원소개",
    children: [
      { href: "/intro/greeting", label: "인사말" },
      { href: "/intro/features", label: "공원 특징" },
      { href: "/intro/directions", label: "오시는 길" },
    ],
  },
  {
    href: "/lots/burial",
    label: "분양안내",
    children: [
      { href: "/lots/burial", label: "매장묘" },
      { href: "/lots/lawn", label: "평장묘" },
      { href: "/lots/columbarium", label: "봉안묘" },
      { href: "/lots/remodeling", label: "리모델링" },
    ],
  },
  {
    href: "/guide/procedure",
    label: "이용안내",
    children: [
      { href: "/guide/procedure", label: "분양 절차" },
      { href: "/guide/fees", label: "관리비" },
      { href: "/guide/services", label: "서비스" },
      { href: "/guide/funeral", label: "장례·안치" },
    ],
  },
  { href: "/gallery", label: "둘러보기" },
  {
    href: "/support/notices",
    label: "고객센터",
    children: [
      { href: "/support/notices", label: "공지사항" },
      { href: "/support/inquiry", label: "문의·상담" },
    ],
  },
];

export const SALE_STEPS = [
  {
    n: "1",
    title: "전화·온라인 상담",
    text: "031-482-2949 또는 문의 양식으로 공원 운영과 상품을 확인합니다.",
  },
  {
    n: "2",
    title: "현장 방문상담",
    text: "실제 모습과 자리를 보며 상담합니다.",
  },
  {
    n: "3",
    title: "청약서 작성",
    text: "안양공원묘원 청약서로 계약합니다.",
  },
  {
    n: "4",
    title: "입금 완료",
    text: "계좌·신용카드·체크카드로 청약서의 금액을 납부합니다. 계좌번호는 사이트에 공개하지 않으며, 청약 후 사무실에서 안내합니다.",
  },
  {
    n: "5",
    title: "묘지 사용",
    text: "사용 희망일 2일 전 관리사무실에 통보하면 이용할 수 있습니다.",
  },
] as const;

export const FEATURES = [
  {
    title: "접근성",
    body: "수도권 서남부, 서울에서 자동차로 약 30분. 영동고속도로 안산IC에서 3분 거리에 있습니다. 라이브 안내의 “접근성이 뛰어난 명당자리”는 이 입지를 가리킵니다.",
  },
  {
    title: "자연친화적인 공원묘원",
    body: "자연 그대로의 모습을 지키며, 고인께는 안식처로, 가족에게는 숨을 고르는 쉼터로 쓰입니다.",
  },
  {
    title: "공원 관리",
    body: "공원이 쓰는 관리 프로그램으로 묘역을 살피며, 벌초에 힘을 씁니다.",
  },
  {
    title: "명절 교통·주차",
    body: "공원 안 여러 곳에 주차 공간이 있어, 명절에도 방문길을 열어둡니다.",
  },
] as const;

export const GREETING = [
  "안양공원은 고인의 편안한 안식과 후손들에게는 고인의 사랑을 기억하고 추모할 수 있는 최적의 장소를 제공하고, 편안한 성묘가 될 수 있도록 최선의 서비스를 제공하고 있습니다.",
  "저희 안양공원은 수도권에 인접하여 서울에서 30분 정도 소요되는 거리에 위치해 있어, 고인이 그리울 때 언제 어디서나 쉽고 빠르게 찾아뵐 수 있는 접근성을 자랑합니다.",
  "사랑했던 고인의 숨결을 간직하는 데 부족함이 없도록 안양공원 임직원 모두는 고객 여러분에게 정성을 다하고, 한 치의 소홀함이 없이 최상의 서비스로 보답할 것을 약속 드립니다.",
] as const;

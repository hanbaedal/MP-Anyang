export type MenuChild = {
  href: string;
  label: string;
};

export type MenuGroup = {
  id: string;
  label: string;
  children: MenuChild[];
};

export const ADMIN_MENU: MenuChild[] = [
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/fees", label: "관리비 현황" },
  { href: "/admin/graves", label: "묘역 관리" },
  { href: "/admin/inquiries", label: "문의·상담" },
  { href: "/admin/memorial", label: "사이버 추모관" },
  { href: "/admin/park", label: "공원 정보" },
];

/** 사이버 추모관 — 서비스상품과 분리된 1급 메뉴 (유료·독립 운영 예정) */
export const MEMORIAL_MENU: MenuChild[] = [
  { href: "/memorial", label: "소개" },
  { href: "/memorial/guide", label: "이용 방법" },
  { href: "/memorial/plans", label: "요금·플랜" },
  { href: "/memorial/my", label: "내 추모관" },
];

export const MENU: MenuGroup[] = [
  {
    id: "about",
    label: "재단소개",
    children: [
      { href: "/about/intro", label: "안양공원 소개" },
      { href: "/about/greeting", label: "대표 인삿말" },
      { href: "/about/history", label: "안양공원 연혁" },
      { href: "/about/guide", label: "이용안내" },
      { href: "/about/location", label: "오시는 길" },
    ],
  },
  {
    id: "lots",
    label: "분양안내",
    children: [
      { href: "/lots/procedure", label: "분양절차" },
      { href: "/lots/fees", label: "분양·관리비" },
      { href: "/lots/columbarium", label: "봉안묘" },
      { href: "/lots/tree", label: "수목장" },
      { href: "/lots/burial", label: "매장묘" },
      { href: "/lots/flat", label: "평장묘" },
      { href: "/lots/composite", label: "복합묘" },
    ],
  },
  {
    id: "facilities",
    label: "시설안내",
    children: [
      { href: "/facilities/garden", label: "정원" },
      { href: "/facilities/cafe", label: "카페" },
      { href: "/facilities/restaurant", label: "식당" },
      { href: "/facilities/office", label: "사무실" },
    ],
  },
  {
    id: "memorial",
    label: "사이버 추모관",
    children: MEMORIAL_MENU,
  },
  {
    id: "services",
    label: "서비스상품",
    children: [
      { href: "/services/memorial", label: "추모" },
      { href: "/services/sangjo", label: "상조" },
      { href: "/services/grave", label: "묘지" },
      { href: "/services/remodel", label: "리모델링" },
    ],
  },
  {
    id: "support",
    label: "고객센터",
    children: [
      { href: "/support/notices", label: "공지사항" },
      { href: "/support/faq", label: "자주묻는 질문" },
      { href: "/support/board", label: "자유게시판" },
      { href: "/support/inquiry", label: "문의사항" },
      { href: "/support/gallery", label: "갤러리" },
    ],
  },
];

export function groupIdFromPath(pathname: string): string | null {
  if (pathname === "/memorial" || pathname.startsWith("/memorial/")) return "memorial";
  const found = MENU.find((group) =>
    group.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`)),
  );
  return found?.id ?? null;
}

export function memorialNavActive(pathname: string, href: string) {
  if (href === "/memorial") return pathname === "/memorial";
  return pathname === href || pathname.startsWith(`${href}/`);
}

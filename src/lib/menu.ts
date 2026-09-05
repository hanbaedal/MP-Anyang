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
  { href: "/admin", label: "관리자 홈" },
  { href: "/admin/members", label: "회원 관리" },
  { href: "/admin/graves", label: "묘역 관리" },
  { href: "/admin/park", label: "공원 정보" },
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
      { href: "/lots/columbarium", label: "봉안묘" },
      { href: "/lots/tree", label: "수목장" },
      { href: "/lots/burial", label: "매장묘" },
      { href: "/lots/flat", label: "평장묘" },
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
  const found = MENU.find((group) =>
    group.children.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`)),
  );
  return found?.id ?? null;
}

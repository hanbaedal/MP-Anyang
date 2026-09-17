import type { Role } from "./auth-types";
import { CMS_SLUGS } from "./cms-types";

export const MANAGE_HOME = "/manage";

export type ManageNavItem = { href: string; i18n: string };

const CORE: ManageNavItem[] = [
  { href: MANAGE_HOME, i18n: "manage.home" },
  { href: "/manage/gallery", i18n: "manage.gallery" },
  { href: "/manage/notices", i18n: "manage.notices" },
  { href: "/manage/inquiries", i18n: "manage.inquiries" },
  { href: "/manage/faq", i18n: "manage.faq" },
];

/** admin·supervisor 탐색기·사이트맵 하위 메뉴 (역할별 동일 규칙) */
export function manageNavItems(role: Role): ManageNavItem[] {
  const items: ManageNavItem[] = [
    ...CORE,
    ...CMS_SLUGS.map((item) => ({
      href: `/manage/pages/${item.slug}`,
      i18n: item.label,
    })),
  ];
  if (role === "supervisor") {
    items.push({ href: "/manage/admins", i18n: "manage.admins" });
  }
  return items;
}

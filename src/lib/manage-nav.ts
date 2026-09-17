import { CMS_SLUGS } from "./cms-types";

export const MANAGE_HOME = "/manage";

export type ManageNavItem = { href: string; i18n: string };

/** 홈페이지 콘텐츠 편집만 (관리 홈·슈퍼바이저 항목 제외) */
export function manageNavItems(): ManageNavItem[] {
  return [
    { href: "/manage/gallery", i18n: "manage.gallery" },
    { href: "/manage/funeral", i18n: "manage.funeral" },
    { href: "/manage/notices", i18n: "manage.notices" },
    { href: "/manage/inquiries", i18n: "manage.inquiries" },
    { href: "/manage/faq", i18n: "manage.faq" },
    ...CMS_SLUGS.map((item) => ({
      href: `/manage/pages/${item.slug}`,
      i18n: item.label,
    })),
  ];
}

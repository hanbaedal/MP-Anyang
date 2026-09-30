/** 슈퍼바이저 전용: DB 동기화·계정 (홈페이지관리와 분리) */
export const SUPERVISOR_NAV = [
  { href: "/supervisor/contracts", i18n: "supervisor.contracts" },
  { href: "/supervisor/fees", i18n: "work.fees" },
  { href: "/supervisor/receipts", i18n: "work.receipts" },
  { href: "/supervisor/reports", i18n: "work.reports" },
  { href: "/supervisor/base", i18n: "work.master" },
  { href: "/supervisor/stats", i18n: "supervisor.stats" },
  { href: "/work/sync", i18n: "work.dbUpdate" },
  { href: "/manage/admins", i18n: "manage.admins" },
] as const;

export const SUPERVISOR_HOME = SUPERVISOR_NAV[0].href;

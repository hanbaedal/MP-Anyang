/** 슈퍼바이저 전용: DB 동기화·계정 (홈페이지관리와 분리) */
export const SUPERVISOR_NAV = [
  { href: "/supervisor/stats", i18n: "supervisor.stats" },
  { href: "/work/sync", i18n: "work.dbUpdate" },
  { href: "/manage/admins", i18n: "manage.admins" },
] as const;

export const SUPERVISOR_HOME = SUPERVISOR_NAV[0].href;

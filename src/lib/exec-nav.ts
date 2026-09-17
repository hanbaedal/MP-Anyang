export const EXEC_NAV = [
  { slug: "fees", href: "/work/exec/fees", i18n: "work.execFees" },
  { slug: "unpaid-list", href: "/work/exec/unpaid-list", i18n: "work.execUnpaidList" },
  { slug: "sales", href: "/work/exec/sales", i18n: "work.execSales" },
  { slug: "contracts", href: "/work/exec/contracts", i18n: "work.execContracts" },
  { slug: "fees-by-year", href: "/work/exec/fees-by-year", i18n: "work.execFeesByYear" },
  { slug: "paid", href: "/work/exec/paid", i18n: "work.execPaid" },
  { slug: "unpaid", href: "/work/exec/unpaid", i18n: "work.execUnpaid" },
  { slug: "all-fees", href: "/work/exec/all-fees", i18n: "work.execAllFees" },
] as const;

export type ExecSection = (typeof EXEC_NAV)[number]["slug"];

export const EXEC_HOME = EXEC_NAV[0].href;

export function isExecSection(value: string): value is ExecSection {
  return EXEC_NAV.some((item) => item.slug === value);
}

export function execNavItem(section: ExecSection) {
  return EXEC_NAV.find((item) => item.slug === section) ?? EXEC_NAV[0];
}

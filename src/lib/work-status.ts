import type { ContractCopy, FeeCopy } from "./cemetery-parse";

export const STATUS_FEE_YEAR = 2026;
export const STATUS_FEE_HISTORY_YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
/** 분양 표: 2020년 이전 한 덩어리, 2021년부터 연·월. 관리비 연도와 다름. */
export const STATUS_SALES_BEFORE_YEAR = 2020;
export const STATUS_SALES_YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;
const UNPAID_STATUSES = new Set(["미납", "납부중", "보류"]);

export type YearMonth = { year: number; month: number };
export type StatusRowKind = "count" | "amount" | "percent";

export type StatusMonthRow = {
  label: string;
  months: number[];
  total: number;
  kind: StatusRowKind;
};

export type WorkFeeYearSummary = {
  year: number;
  /** Unique contracts billed in the fee year. Not the full copy count. */
  targetCount: number;
  paidCount: number;
  unpaidCount: number;
  paidAmount: number;
  unpaidAmount: number;
  /** 납부 / (납부+미납). Both 0 → NaN. */
  paidRate: number;
};

/** All-year unique fee glance. Same key as the year summary. Not 분양 계약 건수. */
export type WorkFeeAllSummary = {
  targetCount: number;
  paidCount: number;
  unpaidCount: number;
  paidAmount: number;
  unpaidAmount: number;
  paidRate: number;
};

export type WorkFeeHistoryRow = {
  label: string;
  paidAmount: number;
  unpaidAmount: number;
  paidCount: number;
  unpaidCount: number;
  paidRate: number;
};

export type UnpaidRosterRow = {
  userName: string;
  tombNo: string;
  remaining: number;
};

export type UnpaidRoster = {
  totalRemaining: number;
  rows: UnpaidRosterRow[];
};

export type WorkStatusTables = {
  syncedAt: string;
  undatedContracts: number;
  undatedFees: number;
  contractCopyCount: number;
  feeAll: WorkFeeAllSummary;
  feeYear: WorkFeeYearSummary;
  unpaidRoster: UnpaidRoster;
  feeHistory: WorkFeeHistoryRow[];
  contracts: StatusMonthRow[];
  paidRows: StatusMonthRow[];
  unpaidRows: StatusMonthRow[];
};

export type FeePayFilter = "all" | "paid" | "unpaid";

type YearAcc = {
  paidAmount: number;
  unpaidAmount: number;
  paidKeys: Set<string>;
  unpaidKeys: Set<string>;
};

/** YYYYMMDD number, or null. Missing day becomes 1. */
export function parseCopyYmd(raw: string | undefined | null): number | null {
  const when = parseCopyDate(raw);
  if (!when) return null;
  const digits = String(raw ?? "").replace(/\D/g, "");
  let day = 1;
  if (digits.length >= 8) {
    const n = Number(digits.slice(6, 8));
    if (n >= 1 && n <= 31) day = n;
  }
  return when.year * 10000 + when.month * 100 + day;
}

export function parseIsoYmd(raw: string | undefined | null): number | null {
  const m = String(raw ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return year * 10000 + month * 100 + day;
}

export function isoFromYmd(n: number) {
  const s = String(n).padStart(8, "0");
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`;
}

export function defaultFeeRange() {
  return {
    from: `${STATUS_FEE_YEAR}-01-01`,
    to: `${STATUS_FEE_YEAR}-12-31`,
  };
}

export function feePayFilter(raw: string | undefined | null): FeePayFilter {
  if (raw === "paid" || raw === "unpaid") return raw;
  return "all";
}

export function feeMatchesPay(row: FeeCopy, filter: FeePayFilter) {
  if (filter === "paid") return isPaidFee(row);
  if (filter === "unpaid") return isUnpaidFee(row);
  return true;
}

export function feeInRange(row: FeeCopy, from: number, to: number) {
  const ymd = parseCopyYmd(row.billedOn);
  if (ymd == null) return false;
  return ymd >= from && ymd <= to;
}

export function contractYearsInCopy(contracts: ContractCopy[]): number[] {
  const years = new Set<number>([STATUS_FEE_YEAR]);
  for (const row of contracts) {
    const when = contractDate(row);
    if (when) years.add(when.year);
  }
  return [...years].sort((a, b) => b - a);
}

export function parseYearParam(raw: string | undefined | null, years: number[], fallback = STATUS_FEE_YEAR) {
  const n = Number(raw);
  if (Number.isInteger(n) && n >= 1900 && n <= 2100) return n;
  return years.includes(fallback) ? fallback : (years[0] ?? fallback);
}

export function buildUnpaidRoster(fees: FeeCopy[]): UnpaidRoster {
  const byKey = new Map<string, { userName: string; tombNo: string; remaining: number; billedOn: string }>();
  for (const row of fees) {
    const key = feeKey(row);
    const add = row.balance > 0 ? row.balance : 0;
    const cur = byKey.get(key);
    if (!cur) {
      byKey.set(key, { userName: row.userName, tombNo: row.tombNo, remaining: add, billedOn: row.billedOn });
      continue;
    }
    cur.remaining += add;
    if (row.billedOn > cur.billedOn) {
      cur.userName = row.userName;
      cur.tombNo = row.tombNo;
      cur.billedOn = row.billedOn;
    }
  }
  const rows = [...byKey.values()]
    .filter((row) => row.remaining > 0)
    .sort((a, b) => b.remaining - a.remaining || a.tombNo.localeCompare(b.tombNo, "ko"))
    .map(({ userName, tombNo, remaining }) => ({ userName, tombNo, remaining }));
  return {
    totalRemaining: rows.reduce((sum, row) => sum + row.remaining, 0),
    rows,
  };
}

export function parseCopyDate(raw: string | undefined | null): YearMonth | null {
  const text = String(raw ?? "").trim();
  if (!text || text === "--" || /^[-./\s]*$/.test(text)) return null;
  const iso = text.match(/(19|20)\d{2}[-./](0[1-9]|1[0-2])(?:[-./](0[1-9]|[12]\d|3[01]))?/);
  if (iso) {
    const year = Number(iso[0].slice(0, 4));
    const month = Number(iso[0].replace(/\D/g, "").slice(4, 6));
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) return { year, month };
  }
  const digits = text.replace(/\D/g, "");
  if (digits.length >= 6) {
    const year = Number(digits.slice(0, 4));
    const month = Number(digits.slice(4, 6));
    if (year >= 1900 && year <= 2100 && month >= 1 && month <= 12) return { year, month };
  }
  return null;
}

export function contractDate(row: ContractCopy): YearMonth | null {
  const extra = row.extra ?? {};
  return parseCopyDate(extra["contractContract.dt_con"] || extra.dt_con) ?? parseCopyDate(row.burialDate);
}

function emptyMonths() {
  return Array.from({ length: 12 }, () => 0);
}

function monthSets() {
  return Array.from({ length: 12 }, () => new Set<string>());
}

function emptyAcc(): YearAcc {
  return { paidAmount: 0, unpaidAmount: 0, paidKeys: new Set(), unpaidKeys: new Set() };
}

function rowFromMonths(label: string, months: number[], kind: StatusRowKind, total?: number): StatusMonthRow {
  return { label, months, total: total ?? months.reduce((sum, n) => sum + n, 0), kind };
}

export function feeKey(row: FeeCopy) {
  return row.tombNo || row.ref || `${row.userName}-${row.billedOn}`;
}

export function isPaidFee(row: FeeCopy) {
  return row.status === "완납" || (row.paidAmount > 0 && row.balance === 0 && row.status !== "미납");
}

export function isUnpaidFee(row: FeeCopy) {
  return UNPAID_STATUSES.has(row.status) || row.balance > 0;
}

function unpaidAmount(row: FeeCopy) {
  if (row.balance > 0) return row.balance;
  return Math.max(0, row.billedAmount - row.paidAmount);
}

function addFee(acc: YearAcc, row: FeeCopy) {
  const key = feeKey(row);
  if (row.paidAmount > 0) acc.paidAmount += row.paidAmount;
  if (isPaidFee(row)) acc.paidKeys.add(key);
  if (isUnpaidFee(row)) {
    acc.unpaidAmount += unpaidAmount(row);
    acc.unpaidKeys.add(key);
  }
}

function historyRow(label: string, acc: YearAcc): WorkFeeHistoryRow {
  return {
    label,
    paidAmount: acc.paidAmount,
    unpaidAmount: acc.unpaidAmount,
    paidCount: acc.paidKeys.size,
    unpaidCount: acc.unpaidKeys.size,
    paidRate: paidShare(acc.paidKeys.size, acc.unpaidKeys.size),
  };
}

/** 미납 ÷ (납부+미납) × 100. Both 0 → NaN (UI shows `-`). */
export function unpaidShare(unpaid: number, paid: number) {
  const den = unpaid + paid;
  if (den === 0) return Number.NaN;
  return (unpaid / den) * 100;
}

/** 납부 ÷ (납부+미납) × 100. Both 0 → NaN (UI shows `-`). */
export function paidShare(paid: number, unpaid: number) {
  const den = paid + unpaid;
  if (den === 0) return Number.NaN;
  return (paid / den) * 100;
}

function emptyFeeYear(): WorkFeeYearSummary {
  return {
    year: STATUS_FEE_YEAR,
    targetCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidRate: Number.NaN,
  };
}

function emptyFeeAll(): WorkFeeAllSummary {
  return {
    targetCount: 0,
    paidCount: 0,
    unpaidCount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    paidRate: Number.NaN,
  };
}

export function buildFeeAllSummary(fees: FeeCopy[]): WorkFeeAllSummary {
  if (fees.length === 0) return emptyFeeAll();
  const byKey = new Map<string, { paidAmount: number; balance: number }>();
  for (const row of fees) {
    const key = feeKey(row);
    const cur = byKey.get(key) ?? { paidAmount: 0, balance: 0 };
    cur.paidAmount += row.paidAmount;
    cur.balance += row.balance > 0 ? row.balance : 0;
    byKey.set(key, cur);
  }
  let paidCount = 0;
  let unpaidCount = 0;
  let paidAmount = 0;
  let unpaidAmount = 0;
  for (const cur of byKey.values()) {
    paidAmount += cur.paidAmount;
    unpaidAmount += cur.balance;
    if (cur.balance > 0) unpaidCount += 1;
    else paidCount += 1;
  }
  return {
    targetCount: byKey.size,
    paidCount,
    unpaidCount,
    paidAmount,
    unpaidAmount,
    paidRate: paidShare(paidCount, unpaidCount),
  };
}

function shareRow(paid: number[], unpaid: number[]): StatusMonthRow {
  return {
    label: "비율",
    kind: "percent",
    months: unpaid.map((value, i) => unpaidShare(value, paid[i])),
    total: unpaidShare(
      unpaid.reduce((sum, n) => sum + n, 0),
      paid.reduce((sum, n) => sum + n, 0),
    ),
  };
}

export function buildWorkStatusTables(
  contracts: ContractCopy[],
  fees: FeeCopy[],
  syncedAt = "",
): WorkStatusTables {
  const before = emptyMonths();
  const byYear = new Map<number, number[]>(STATUS_SALES_YEARS.map((year) => [year, emptyMonths()]));
  let undatedContracts = 0;

  for (const row of contracts) {
    const when = contractDate(row);
    if (!when) {
      undatedContracts += 1;
      continue;
    }
    if (when.year <= STATUS_SALES_BEFORE_YEAR) {
      before[when.month - 1] += 1;
      continue;
    }
    const bucket = byYear.get(when.year);
    if (bucket) bucket[when.month - 1] += 1;
  }

  const paidMonths = emptyMonths();
  const unpaidMonths = emptyMonths();
  const paidKeys = new Set<string>();
  const unpaidKeys = new Set<string>();
  const targetKeys = new Set<string>();
  const paidMonthKeys = monthSets();
  const unpaidMonthKeys = monthSets();
  const feeBefore = emptyAcc();
  const feeByYear = new Map<number, YearAcc>(STATUS_FEE_HISTORY_YEARS.map((year) => [year, emptyAcc()]));
  let undatedFees = 0;

  for (const row of fees) {
    const when = parseCopyDate(row.billedOn);
    if (!when) {
      undatedFees += 1;
      continue;
    }
    if (when.year <= 2010) {
      addFee(feeBefore, row);
      continue;
    }
    if (when.year < STATUS_FEE_YEAR) {
      const acc = feeByYear.get(when.year);
      if (acc) addFee(acc, row);
      continue;
    }
    if (when.year !== STATUS_FEE_YEAR) continue;
    const monthIndex = when.month - 1;
    const key = feeKey(row);
    targetKeys.add(key);
    if (row.paidAmount > 0) paidMonths[monthIndex] += row.paidAmount;
    if (isPaidFee(row)) {
      paidKeys.add(key);
      paidMonthKeys[monthIndex].add(key);
    }
    if (isUnpaidFee(row)) {
      unpaidMonths[monthIndex] += unpaidAmount(row);
      unpaidKeys.add(key);
      unpaidMonthKeys[monthIndex].add(key);
    }
  }

  const paidAmount = paidMonths.reduce((sum, n) => sum + n, 0);
  const unpaidAmountTotal = unpaidMonths.reduce((sum, n) => sum + n, 0);
  const feeYear: WorkFeeYearSummary = {
    ...emptyFeeYear(),
    targetCount: targetKeys.size,
    paidCount: paidKeys.size,
    unpaidCount: unpaidKeys.size,
    paidAmount,
    unpaidAmount: unpaidAmountTotal,
    paidRate: paidShare(paidKeys.size, unpaidKeys.size),
  };

  return {
    syncedAt,
    undatedContracts,
    undatedFees,
    contractCopyCount: contracts.length,
    feeAll: buildFeeAllSummary(fees),
    feeYear,
    unpaidRoster: buildUnpaidRoster(fees),
    feeHistory: [
      historyRow("2010년 이전", feeBefore),
      ...STATUS_FEE_HISTORY_YEARS.map((year) => historyRow(`${year}년`, feeByYear.get(year) ?? emptyAcc())),
    ],
    contracts: [
      rowFromMonths("2020년 이전", before, "count"),
      ...STATUS_SALES_YEARS.map((year) => rowFromMonths(`${year}년`, byYear.get(year) ?? emptyMonths(), "count")),
    ],
    paidRows: [
      rowFromMonths("그달 납부 금액", paidMonths, "amount"),
      rowFromMonths(
        "그달 납부 인원",
        paidMonthKeys.map((set) => set.size),
        "count",
        paidKeys.size,
      ),
    ],
    unpaidRows: [
      rowFromMonths("그달 미납 금액", unpaidMonths, "amount"),
      rowFromMonths(
        "그달 미납 인원",
        unpaidMonthKeys.map((set) => set.size),
        "count",
        unpaidKeys.size,
      ),
      shareRow(paidMonths, unpaidMonths),
    ],
  };
}

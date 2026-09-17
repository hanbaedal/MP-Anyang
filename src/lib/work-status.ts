import type { ContractCopy, FeeCopy } from "./cemetery-parse";

export const STATUS_YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026] as const;
export const STATUS_FEE_YEAR = 2026;
export const STATUS_FEE_HISTORY_YEARS = [2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025] as const;
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

export type WorkFeeHistoryRow = {
  label: string;
  paidAmount: number;
  unpaidAmount: number;
  paidCount: number;
  unpaidCount: number;
  paidRate: number;
};

export type WorkStatusTables = {
  syncedAt: string;
  undatedContracts: number;
  undatedFees: number;
  contractCopyCount: number;
  feeYear: WorkFeeYearSummary;
  feeHistory: WorkFeeHistoryRow[];
  contracts: StatusMonthRow[];
  paidRows: StatusMonthRow[];
  unpaidRows: StatusMonthRow[];
};

type YearAcc = {
  paidAmount: number;
  unpaidAmount: number;
  paidKeys: Set<string>;
  unpaidKeys: Set<string>;
};

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

function feeKey(row: FeeCopy) {
  return row.tombNo || row.ref || `${row.userName}-${row.billedOn}`;
}

function isPaidFee(row: FeeCopy) {
  return row.status === "완납" || (row.paidAmount > 0 && row.balance === 0 && row.status !== "미납");
}

function isUnpaidFee(row: FeeCopy) {
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
  const byYear = new Map<number, number[]>(STATUS_YEARS.map((year) => [year, emptyMonths()]));
  let undatedContracts = 0;

  for (const row of contracts) {
    const when = contractDate(row);
    if (!when) {
      undatedContracts += 1;
      continue;
    }
    if (when.year <= 2010) {
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
    feeYear,
    feeHistory: [
      historyRow("2010년 이전", feeBefore),
      ...STATUS_FEE_HISTORY_YEARS.map((year) => historyRow(`${year}년`, feeByYear.get(year) ?? emptyAcc())),
    ],
    contracts: [
      rowFromMonths("2010년 이전", before, "count"),
      ...STATUS_YEARS.map((year) => rowFromMonths(`${year}년`, byYear.get(year) ?? emptyMonths(), "count")),
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

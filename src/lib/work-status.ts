import type { ContractCopy, FeeCopy } from "./cemetery-parse";

export const STATUS_YEARS = [2021, 2022, 2023, 2024, 2025, 2026] as const;
export const STATUS_FEE_YEAR = 2026;
const UNPAID_STATUSES = new Set(["미납", "납부중", "보류"]);

export type YearMonth = { year: number; month: number };

export type StatusMonthRow = {
  label: string;
  months: number[];
  total: number;
};

export type WorkStatusTables = {
  syncedAt: string;
  undatedContracts: number;
  contracts: StatusMonthRow[];
  paidCount: number;
  unpaidCount: number;
  paid: StatusMonthRow;
  unpaid: StatusMonthRow;
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

function rowFromMonths(label: string, months: number[]): StatusMonthRow {
  return { label, months, total: months.reduce((sum, n) => sum + n, 0) };
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
    if (when.year <= 2020) {
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

  for (const row of fees) {
    const when = parseCopyDate(row.billedOn);
    if (!when || when.year !== STATUS_FEE_YEAR) continue;
    const monthIndex = when.month - 1;
    const key = feeKey(row);
    if (row.paidAmount > 0) paidMonths[monthIndex] += row.paidAmount;
    if (isPaidFee(row)) paidKeys.add(key);
    if (isUnpaidFee(row)) {
      unpaidMonths[monthIndex] += unpaidAmount(row);
      unpaidKeys.add(key);
    }
  }

  return {
    syncedAt,
    undatedContracts,
    contracts: [
      rowFromMonths("2020년 이전", before),
      ...STATUS_YEARS.map((year) => rowFromMonths(`${year}년`, byYear.get(year) ?? emptyMonths())),
    ],
    paidCount: paidKeys.size,
    unpaidCount: unpaidKeys.size,
    paid: rowFromMonths("납부액", paidMonths),
    unpaid: rowFromMonths("미납액", unpaidMonths),
  };
}

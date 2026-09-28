import type { ContractCopy, FeeCopy } from "./cemetery-parse";
import { koreanWonAmount } from "./korean-won";
import { parseCopyDate, parseCopyYmd } from "./work-status";

export const STATEMENT_FACILITY = {
  name: "(재단법인) 안양공원묘원",
  bizNo: "107-82-01529",
  address: "경기도 안산시 상록구 오리골길 41 (양상동 산50)",
  representative: "최정순",
  phone: "031-482-2949",
  footnote:
    "* 참고 : 묘지완공후 연 2~3회는 재단에서 벌초하고 잡초는 연고자님께서 관리하셔야 합니다.",
} as const;

export type DateParts = { year: string; month: string; day: string };

export type StatementLine = {
  item: string;
  spec: string;
  qty: string;
  unitPrice: string;
  amount: string;
};

export type StatementPayload = {
  serial: string;
  sideLabel: "(회사용)" | "(고객용)";
  deceased: string;
  familyName: string;
  burial: DateParts;
  tombNo: string;
  pyeong: string;
  transaction: DateParts;
  amountKr: string;
  amountNum: string;
  mgmtPeriod: string;
  mgmtAmount: string;
  sanPeriod: string;
  sanAmount: string;
  lines: StatementLine[];
};

function ymdParts(raw: string | undefined | null, fallback = new Date()): DateParts {
  const ymd = parseCopyYmd(raw);
  if (ymd != null) {
    const s = String(ymd).padStart(8, "0");
    return { year: s.slice(0, 4), month: s.slice(4, 6), day: s.slice(6, 8) };
  }
  const when = parseCopyDate(raw);
  if (when) {
    return { year: String(when.year), month: String(when.month).padStart(2, "0"), day: "01" };
  }
  return {
    year: String(fallback.getFullYear()),
    month: String(fallback.getMonth() + 1).padStart(2, "0"),
    day: String(fallback.getDate()).padStart(2, "0"),
  };
}

function formatWon(n: number) {
  return n.toLocaleString("ko-KR");
}

export function contractForTomb(contracts: ContractCopy[], tombNo: string): ContractCopy | undefined {
  const t = tombNo.trim();
  if (!t) return undefined;
  return contracts.find((c) => c.tombNo === t) ?? contracts.find((c) => c.tombNo.includes(t));
}

function buildOneSide(
  fee: FeeCopy,
  contract: ContractCopy | undefined,
  sideLabel: "(회사용)" | "(고객용)",
  serial: string,
): StatementPayload {
  const amount = fee.paidAmount > 0 ? fee.paidAmount : fee.billedAmount;
  const lines: StatementLine[] = Array.from({ length: 6 }, () => ({
    item: "",
    spec: "",
    qty: "",
    unitPrice: "",
    amount: "",
  }));
  lines[0] = {
    item: "관리비",
    spec: fee.period,
    qty: "1",
    unitPrice: formatWon(amount),
    amount: formatWon(amount),
  };

  return {
    serial,
    sideLabel,
    deceased: contract?.userName || fee.userName,
    familyName: contract?.familyName ?? "",
    burial: ymdParts(contract?.burialDate),
    tombNo: fee.tombNo || contract?.tombNo || "",
    pyeong: contract?.pyeong ?? "",
    transaction: ymdParts(fee.billedOn),
    amountKr: koreanWonAmount(amount),
    amountNum: formatWon(amount),
    mgmtPeriod: fee.period,
    mgmtAmount: formatWon(amount),
    sanPeriod: "",
    sanAmount: "",
    lines,
  };
}

export function buildStatementPair(fee: FeeCopy, contracts: ContractCopy[], serial: string) {
  const contract = contractForTomb(contracts, fee.tombNo);
  return {
    company: buildOneSide(fee, contract, "(회사용)", serial),
    customer: buildOneSide(fee, contract, "(고객용)", serial),
  };
}

export const RECEIPT_PRINT_MAX = 50;

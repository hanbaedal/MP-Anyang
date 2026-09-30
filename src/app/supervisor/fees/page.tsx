import { SupervisorFeeList, type FeeHit, type FeeLine } from "@/components/supervisor-fee-list";
import { requireSupervisor } from "@/lib/auth";
import type { FeeCopy } from "@/lib/cemetery-parse";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { ledgerWindow } from "@/components/supervisor-ledger";
import { readWorkDumpBySlice } from "@/lib/work-store";

export const dynamic = "force-dynamic";

const STATUSES = new Set(["미납", "납부중", "보류", "완납"]);

function feeYmd(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const n = Number(digits.slice(0, 8));
  return Number.isFinite(n) ? n : null;
}

function iso(raw: string | undefined, fallback: string) {
  const value = raw?.trim() ?? "";
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback;
}

function ymd(isoDate: string) {
  return Number(isoDate.replaceAll("-", ""));
}

function money(n: number) {
  return n.toLocaleString("ko-KR");
}

function lineOf(row: FeeCopy): FeeLine {
  return {
    billedOn: row.billedOn,
    tombNo: row.tombNo,
    userName: row.userName,
    period: row.period,
    billed: money(row.billedAmount),
    paid: money(row.paidAmount),
    balance: money(row.balance),
    dueDate: row.dueDate,
    status: row.status,
    billedNum: row.billedAmount,
    paidNum: row.paidAmount,
    balanceNum: row.balance,
  };
}

function groupOf(row: FeeCopy) {
  return row.ref.trim() || row.tombNo;
}

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.fees") };
}

export default async function SupervisorFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; gubun?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const params = await searchParams;
  const year = new Date().getFullYear();
  const from = iso(params.from, `${year}-01-01`);
  const to = iso(params.to, `${year}-12-31`);
  const gubun = STATUSES.has(params.gubun ?? "") ? (params.gubun as string) : "전체";
  const fromYmd = ymd(from);
  const toYmd = ymd(to);
  const dump = await readWorkDumpBySlice("fees");
  const found = dump.fees.filter((row) => {
    const billed = feeYmd(row.billedOn);
    if (billed == null || billed < Math.min(fromYmd, toYmd) || billed > Math.max(fromYmd, toYmd)) return false;
    if (gubun !== "전체" && row.status.trim() !== gubun) return false;
    return true;
  });
  found.sort((a, b) => (feeYmd(b.billedOn) ?? 0) - (feeYmd(a.billedOn) ?? 0) || a.tombNo.localeCompare(b.tombNo, "ko"));
  const window = ledgerWindow(found.length, params.pg);
  const pageRows = found.slice(window.from, window.from + window.size);
  const groups = new Set(pageRows.map(groupOf));
  const details: Record<string, FeeLine[]> = {};
  for (const row of dump.fees) {
    const group = groupOf(row);
    if (!groups.has(group)) continue;
    const list = details[group] ?? [];
    list.push(lineOf(row));
    details[group] = list;
  }
  for (const list of Object.values(details)) {
    list.sort((a, b) => (feeYmd(a.billedOn) ?? 0) - (feeYmd(b.billedOn) ?? 0));
  }
  const hits: FeeHit[] = pageRows.map((row) => ({ ...lineOf(row), group: groupOf(row) }));
  return (
    <SupervisorFeeList
      action="/supervisor/fees"
      from={from}
      to={to}
      gubun={gubun}
      page={window.page}
      pages={window.pages}
      total={found.length}
      hits={hits}
      details={details}
    />
  );
}

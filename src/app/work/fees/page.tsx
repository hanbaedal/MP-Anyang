import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkCopiedTable } from "@/components/work-copied-table";
import { WorkFeeFilter } from "@/components/work-lookup-filters";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";
import { defaultFeeRange, feeInRange, feeMatchesPay, feePayFilter, isoFromYmd, parseIsoYmd } from "@/lib/work-status";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.fees") };
}

export default async function WorkFeesPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string }>;
}) {
  const params = await searchParams;
  const { locale, session, dump, envReady } = await loadWorkCopyPage("fees");
  const fallback = defaultFeeRange();
  let from = parseIsoYmd(params.from) ?? parseIsoYmd(fallback.from)!;
  let to = parseIsoYmd(params.to) ?? parseIsoYmd(fallback.to)!;
  if (from > to) {
    const swap = from;
    from = to;
    to = swap;
  }
  const fromIso = isoFromYmd(from);
  const toIso = isoFromYmd(to);
  const status = feePayFilter(params.status);
  const matched = dump.fees.filter((row) => feeInRange(row, from, to) && feeMatchesPay(row, status));
  const rows = matched.map((row) => ({
    billedOn: row.billedOn,
    tombNo: row.tombNo,
    userName: row.userName,
    period: row.period,
    billedAmount: row.billedAmount.toLocaleString("ko-KR"),
    paidAmount: row.paidAmount.toLocaleString("ko-KR"),
    balance: row.balance.toLocaleString("ko-KR"),
    dueDate: row.dueDate,
    status: row.status,
  }));
  const copyMissing = dump.fees.length === 0;
  const lead = copyMissing
    ? undefined
    : `${t(locale, "work.feeFilterLead")} ${t(locale, rows.length ? "work.feeFilterCount" : "work.feeFilterEmpty", { n: rows.length.toLocaleString("ko-KR") })}`;

  return (
    <WorkCopiedTable
      title={t(locale, "work.fees")}
      lead={lead}
      syncedAt={dump.meta?.syncedAt}
      toolbar={<WorkFeeFilter locale={locale} from={fromIso} to={toIso} status={status} />}
      groupLabel={t(locale, "work.noZone")}
      columns={[
        { key: "billedOn", label: "청구일자" },
        { key: "tombNo", label: "묘지번호" },
        { key: "userName", label: "사용자" },
        { key: "period", label: "적용기간" },
        { key: "billedAmount", label: "청구금액", numeric: true },
        { key: "paidAmount", label: "납부금액", numeric: true },
        { key: "balance", label: "잔액", numeric: true },
        { key: "dueDate", label: "납부기한" },
        { key: "status", label: "구분" },
      ]}
      rows={rows}
      empty={
        copyMissing ? (
          <WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />
        ) : (
          <p className="rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">
            {t(locale, "work.feeFilterEmpty")}
          </p>
        )
      }
    />
  );
}

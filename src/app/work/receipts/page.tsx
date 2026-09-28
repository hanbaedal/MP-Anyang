import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkReceiptFilter } from "@/components/work-lookup-filters";
import { WorkReceiptsPanel } from "@/components/work-receipts-panel";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";
import {
  defaultFeeRange,
  feeInRange,
  feeMatchesPay,
  feePayFilter,
  isoFromYmd,
  parseIsoYmd,
  tombNoMatches,
} from "@/lib/work-status";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.receipts") };
}

export default async function WorkReceiptsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; status?: string; tomb?: string }>;
}) {
  const params = await searchParams;
  const { locale, session, dump, envReady } = await loadWorkCopyPage("receipts");
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
  const status = feePayFilter(params.status ?? "paid");
  const tomb = params.tomb?.trim() ?? "";
  const matched = dump.fees.filter(
    (row) =>
      feeInRange(row, from, to) &&
      feeMatchesPay(row, status) &&
      tombNoMatches(row, tomb),
  );
  const copyMissing = dump.fees.length === 0 && dump.contracts.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 pb-28">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "work.receipts")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(locale, "work.receiptsLead")}</p>
        {dump.meta?.syncedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            복사 시각 {new Date(dump.meta.syncedAt).toLocaleString("ko-KR")}
          </p>
        ) : null}
      </div>
      <WorkReceiptFilter locale={locale} from={fromIso} to={toIso} status={status} tomb={tomb} />
      {copyMissing ? (
        <WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />
      ) : matched.length === 0 ? (
        <p className="rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">{t(locale, "work.feeFilterEmpty")}</p>
      ) : (
        <WorkReceiptsPanel fees={matched} contracts={dump.contracts} />
      )}
    </div>
  );
}

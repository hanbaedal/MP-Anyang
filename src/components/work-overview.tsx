import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { t, type Locale } from "@/lib/i18n";
import type { StatusMonthRow, WorkFeeHistoryRow, WorkFeeYearSummary, WorkStatusTables } from "@/lib/work-status";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const TABLE_WRAP = "max-h-none min-h-min shrink-0 overflow-x-auto overflow-y-clip rounded-md border bg-card";

function formatCount(n: number) {
  return n.toLocaleString("ko-KR");
}

function formatThousandWon(n: number) {
  return Math.floor(n / 1000).toLocaleString("ko-KR");
}

function formatPercent(n: number) {
  if (!Number.isFinite(n)) return "-";
  return `${n.toFixed(1)}%`;
}

function formatCell(row: StatusMonthRow, n: number) {
  if (row.kind === "amount") return formatThousandWon(n);
  if (row.kind === "percent") return formatPercent(n);
  return formatCount(n);
}

function StatusTable({
  caption,
  rows,
  firstHeader,
  lastHeader,
  unitLabel,
  footnote,
}: {
  caption: string;
  rows: StatusMonthRow[];
  firstHeader: string;
  lastHeader: string;
  unitLabel?: string;
  footnote?: string;
}) {
  return (
    <div className="max-h-none min-h-min shrink-0">
      {unitLabel ? (
        <p className="mb-0.5 text-right text-[10px] leading-none text-muted-foreground">{unitLabel}</p>
      ) : null}
      <div className={TABLE_WRAP}>
        <table className="w-max min-w-full border-collapse text-[11px] leading-tight sm:text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-muted/50 px-1.5 py-0.5 text-left font-medium whitespace-nowrap">
                {firstHeader}
              </th>
              {MONTHS.map((label) => (
                <th key={label} scope="col" className="px-1 py-0.5 text-right font-medium whitespace-nowrap">
                  {label}
                </th>
              ))}
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {lastHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-card px-1.5 py-0.5 text-left font-medium whitespace-nowrap"
                >
                  {row.label}
                </th>
                {row.months.map((value, i) => (
                  <td key={MONTHS[i]} className="px-1 py-0.5 text-right tabular-nums whitespace-nowrap">
                    {formatCell(row, value)}
                  </td>
                ))}
                <td className="px-1.5 py-0.5 text-right font-medium tabular-nums whitespace-nowrap">
                  {formatCell(row, row.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? <p className="mt-1 text-[9px] leading-tight text-muted-foreground">{footnote}</p> : null}
    </div>
  );
}

function FeeHistoryTable({
  caption,
  rows,
  yearHeader,
  paidAmountHeader,
  unpaidAmountHeader,
  paidCountHeader,
  unpaidCountHeader,
  rateHeader,
  unitLabel,
  footnote,
}: {
  caption: string;
  rows: WorkFeeHistoryRow[];
  yearHeader: string;
  paidAmountHeader: string;
  unpaidAmountHeader: string;
  paidCountHeader: string;
  unpaidCountHeader: string;
  rateHeader: string;
  unitLabel?: string;
  footnote?: string;
}) {
  return (
    <div className="max-h-none min-h-min shrink-0">
      {unitLabel ? (
        <p className="mb-0.5 text-right text-[10px] leading-none text-muted-foreground">{unitLabel}</p>
      ) : null}
      <div className={TABLE_WRAP}>
        <table className="w-max min-w-full border-collapse text-[11px] leading-tight sm:text-xs">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b bg-muted/50 text-muted-foreground">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-muted/50 px-1.5 py-0.5 text-left font-medium whitespace-nowrap">
                {yearHeader}
              </th>
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {paidAmountHeader}
              </th>
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {unpaidAmountHeader}
              </th>
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {paidCountHeader}
              </th>
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {unpaidCountHeader}
              </th>
              <th scope="col" className="px-1.5 py-0.5 text-right font-medium whitespace-nowrap">
                {rateHeader}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b last:border-b-0">
                <th scope="row" className="sticky left-0 z-10 bg-card px-1.5 py-0.5 text-left font-medium whitespace-nowrap">
                  {row.label}
                </th>
                <td className="px-1.5 py-0.5 text-right tabular-nums whitespace-nowrap">{formatThousandWon(row.paidAmount)}</td>
                <td className="px-1.5 py-0.5 text-right tabular-nums whitespace-nowrap">{formatThousandWon(row.unpaidAmount)}</td>
                <td className="px-1.5 py-0.5 text-right tabular-nums whitespace-nowrap">{formatCount(row.paidCount)}</td>
                <td className="px-1.5 py-0.5 text-right tabular-nums whitespace-nowrap">{formatCount(row.unpaidCount)}</td>
                <td className="px-1.5 py-0.5 text-right font-medium tabular-nums whitespace-nowrap">{formatPercent(row.paidRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footnote ? <p className="mt-1 text-[9px] leading-tight text-muted-foreground">{footnote}</p> : null}
    </div>
  );
}

function FeeYearSummary({ locale, summary, unit }: { locale: Locale; summary: WorkFeeYearSummary; unit: string }) {
  const items = [
    { label: t(locale, "work.feeTarget"), value: t(locale, "work.feeCountUnit", { n: formatCount(summary.targetCount) }) },
    { label: t(locale, "work.feePaidDone"), value: t(locale, "work.feeCountUnit", { n: formatCount(summary.paidCount) }) },
    { label: t(locale, "work.feeUnpaid"), value: t(locale, "work.feeCountUnit", { n: formatCount(summary.unpaidCount) }) },
    { label: t(locale, "work.feePaidRate"), value: formatPercent(summary.paidRate) },
    { label: t(locale, "work.feePaidAmount"), value: formatThousandWon(summary.paidAmount) },
    { label: t(locale, "work.feeUnpaidAmount"), value: formatThousandWon(summary.unpaidAmount) },
  ];
  return (
    <section className="flex max-h-none min-h-min shrink-0 flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <h2 className="text-xs font-medium text-primary sm:text-sm">{t(locale, "work.feeYearSummary", { year: summary.year })}</h2>
        <p className="text-[10px] leading-none text-muted-foreground">{unit}</p>
      </div>
      <Card className="gap-0 py-0 shadow-none">
        <CardContent className="grid grid-cols-2 gap-px bg-border p-0 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <div key={item.label} className="bg-card px-2.5 py-2">
              <p className="text-[10px] leading-tight text-muted-foreground">{item.label}</p>
              <p className="mt-0.5 text-base font-semibold tabular-nums text-primary sm:text-lg">{item.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <p className="text-[9px] leading-tight text-muted-foreground">{t(locale, "work.feeYearLead", { year: summary.year })}</p>
    </section>
  );
}

function StatusBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex max-h-none min-h-min shrink-0 flex-col gap-1.5">
      <h2 className="text-xs font-medium text-primary sm:text-sm">{title}</h2>
      {children}
    </section>
  );
}

export function WorkOverviewCards({ locale, status }: { locale: Locale; status: WorkStatusTables }) {
  const year = status.feeYear.year;
  const empty =
    status.contractCopyCount === 0 &&
    status.feeYear.targetCount === 0 &&
    status.feeHistory.every((row) => row.paidCount === 0 && row.unpaidCount === 0) &&
    status.contracts.every((row) => row.total === 0);
  const unit = t(locale, "work.amountUnit");
  const copyTotal = t(locale, "work.contractCopyTotal", { n: formatCount(status.contractCopyCount) });
  const undatedNote =
    status.undatedContracts > 0
      ? t(locale, "work.statusUndated", { n: formatCount(status.undatedContracts) })
      : undefined;
  const feeHistoryNote = [
    t(locale, "work.feesByYearNote", { year }),
    status.undatedFees > 0 ? t(locale, "work.feesUndated", { n: formatCount(status.undatedFees) }) : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="mx-auto flex h-auto min-h-min max-w-[1100px] flex-col gap-8 px-3 py-3 pb-8 sm:gap-10 sm:px-4 sm:py-4">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="font-serif text-base text-primary">{t(locale, "work.overview")}</h1>
        {status.syncedAt ? (
          <p className="text-[10px] text-muted-foreground">
            {t(locale, "work.copiedAt", { when: new Date(status.syncedAt).toLocaleString("ko-KR") })}
          </p>
        ) : null}
        {empty ? <p className="w-full text-xs text-muted-foreground">{t(locale, "work.empty")}</p> : null}
      </header>

      <FeeYearSummary locale={locale} summary={status.feeYear} unit={unit} />

      <StatusBlock title={t(locale, "work.feesByYear")}>
        <FeeHistoryTable
          caption={t(locale, "work.feesByYear")}
          rows={status.feeHistory}
          yearHeader={t(locale, "work.statusPeriod")}
          paidAmountHeader={t(locale, "work.feePaidAmount")}
          unpaidAmountHeader={t(locale, "work.feeUnpaidAmount")}
          paidCountHeader={t(locale, "work.colPaidUnique")}
          unpaidCountHeader={t(locale, "work.colUnpaidUnique")}
          rateHeader={t(locale, "work.feePaidRate")}
          unitLabel={unit}
          footnote={feeHistoryNote}
        />
      </StatusBlock>

      <StatusBlock title={t(locale, "work.statusPaidTable", { year })}>
        <StatusTable
          caption={t(locale, "work.statusPaidTable", { year })}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.paidRows}
          unitLabel={unit}
          footnote={t(locale, "work.monthCountNote")}
        />
      </StatusBlock>

      <StatusBlock title={t(locale, "work.statusUnpaidTable", { year })}>
        <StatusTable
          caption={t(locale, "work.statusUnpaidTable", { year })}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.unpaidRows}
          unitLabel={unit}
          footnote={t(locale, "work.monthCountNote")}
        />
      </StatusBlock>

      <StatusBlock title={t(locale, "work.contractsByYear")}>
        <StatusTable
          caption={t(locale, "work.contractsByYear")}
          firstHeader={t(locale, "work.statusPeriod")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.contracts}
          unitLabel={copyTotal}
          footnote={undatedNote}
        />
      </StatusBlock>
    </div>
  );
}

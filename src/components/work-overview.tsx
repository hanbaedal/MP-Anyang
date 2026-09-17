import type { ReactNode } from "react";
import { t, type Locale } from "@/lib/i18n";
import type { StatusMonthRow, WorkStatusTables } from "@/lib/work-status";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

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
  compact,
  footnote,
}: {
  caption: string;
  rows: StatusMonthRow[];
  firstHeader: string;
  lastHeader: string;
  unitLabel?: string;
  compact?: boolean;
  footnote?: string;
}) {
  const cellY = compact ? "py-0" : "py-0.5";
  return (
    <div className="max-h-none min-h-min shrink-0">
      {unitLabel ? (
        <p className="mb-0.5 text-right text-[10px] leading-none text-muted-foreground">{unitLabel}</p>
      ) : null}
      <div className="max-h-none overflow-x-auto overflow-y-visible rounded-md border bg-card">
        <table className="w-max min-w-full border-collapse text-[10px] leading-tight sm:text-[11px]">
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
                  className={`sticky left-0 z-10 bg-card px-1.5 text-left font-medium whitespace-nowrap ${cellY}`}
                >
                  {row.label}
                </th>
                {row.months.map((value, i) => (
                  <td key={MONTHS[i]} className={`px-1 text-right tabular-nums whitespace-nowrap ${cellY}`}>
                    {formatCell(row, value)}
                  </td>
                ))}
                <td className={`px-1.5 text-right font-medium tabular-nums whitespace-nowrap ${cellY}`}>
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

function StatusBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex max-h-none min-h-min shrink-0 flex-col gap-1.5">
      <h2 className="text-xs font-medium text-primary sm:text-sm">{title}</h2>
      {children}
    </section>
  );
}

export function WorkOverviewCards({ locale, status }: { locale: Locale; status: WorkStatusTables }) {
  const empty =
    status.contractCopyCount === 0 &&
    status.contracts.every((row) => row.total === 0) &&
    (status.paidRows[0]?.total ?? 0) === 0 &&
    (status.unpaidRows[0]?.total ?? 0) === 0;
  const unit = t(locale, "work.amountUnit");
  const copyTotal = t(locale, "work.contractCopyTotal", { n: formatCount(status.contractCopyCount) });
  const undatedNote =
    status.undatedContracts > 0
      ? t(locale, "work.statusUndated", { n: formatCount(status.undatedContracts) })
      : undefined;

  return (
    <div className="mx-auto flex h-auto min-h-min max-w-[1100px] flex-col gap-6 px-3 py-2 sm:gap-8 sm:px-4 sm:py-3">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="font-serif text-base text-primary">{t(locale, "work.overview")}</h1>
        {status.syncedAt ? (
          <p className="text-[10px] text-muted-foreground">
            {t(locale, "work.copiedAt", { when: new Date(status.syncedAt).toLocaleString("ko-KR") })}
          </p>
        ) : null}
        {empty ? <p className="w-full text-xs text-muted-foreground">{t(locale, "work.empty")}</p> : null}
      </header>

      <StatusBlock title={t(locale, "work.contractCount")}>
        <StatusTable
          caption={t(locale, "work.contractCount")}
          firstHeader={t(locale, "work.statusPeriod")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.contracts}
          unitLabel={copyTotal}
          compact
          footnote={undatedNote}
        />
      </StatusBlock>

      <StatusBlock title={t(locale, "work.statusPaidTable")}>
        <StatusTable
          caption={t(locale, "work.statusPaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={status.paidRows}
          unitLabel={unit}
        />
      </StatusBlock>

      <StatusBlock title={t(locale, "work.statusUnpaidTable")}>
        <StatusTable
          caption={t(locale, "work.statusUnpaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={status.unpaidRows}
          unitLabel={unit}
        />
      </StatusBlock>
    </div>
  );
}

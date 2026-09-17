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
}: {
  caption: string;
  rows: StatusMonthRow[];
  firstHeader: string;
  lastHeader: string;
  unitLabel?: string;
  compact?: boolean;
}) {
  const cellY = compact ? "py-0" : "py-0.5";
  return (
    <div>
      {unitLabel ? (
        <p className="mb-0.5 text-right text-[10px] leading-none text-muted-foreground">{unitLabel}</p>
      ) : null}
      <div className="overflow-x-auto rounded-md border bg-card">
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
    </div>
  );
}

export function WorkOverviewCards({ locale, status }: { locale: Locale; status: WorkStatusTables }) {
  const empty =
    status.contracts.every((row) => row.total === 0) &&
    (status.paidRows[0]?.total ?? 0) === 0 &&
    (status.unpaidRows[0]?.total ?? 0) === 0;
  const unit = t(locale, "work.amountUnit");

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="font-serif text-base text-primary">{t(locale, "work.overview")}</h1>
        {status.syncedAt ? (
          <p className="text-[10px] text-muted-foreground">
            {t(locale, "work.copiedAt", { when: new Date(status.syncedAt).toLocaleString("ko-KR") })}
          </p>
        ) : null}
        {empty ? <p className="w-full text-xs text-muted-foreground">{t(locale, "work.empty")}</p> : null}
      </header>

      <section className="space-y-0.5">
        <h2 className="text-xs font-medium text-primary sm:text-sm">{t(locale, "work.contractCount")}</h2>
        <StatusTable
          caption={t(locale, "work.contractCount")}
          firstHeader={t(locale, "work.statusPeriod")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.contracts}
          compact
        />
        {status.undatedContracts > 0 ? (
          <p className="text-[10px] text-muted-foreground">
            {t(locale, "work.statusUndated", { n: formatCount(status.undatedContracts) })}
          </p>
        ) : null}
      </section>

      <section className="space-y-0.5">
        <h2 className="text-xs font-medium text-primary sm:text-sm">{t(locale, "work.statusPaidTable")}</h2>
        <StatusTable
          caption={t(locale, "work.statusPaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={status.paidRows}
          unitLabel={unit}
        />
      </section>

      <section className="space-y-0.5">
        <h2 className="text-xs font-medium text-primary sm:text-sm">{t(locale, "work.statusUnpaidTable")}</h2>
        <StatusTable
          caption={t(locale, "work.statusUnpaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={status.unpaidRows}
          unitLabel={unit}
        />
      </section>
    </div>
  );
}

import { t, type Locale } from "@/lib/i18n";
import type { StatusMonthRow, WorkStatusTables } from "@/lib/work-status";

const MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];

function formatNum(n: number) {
  return n.toLocaleString("ko-KR");
}

function StatusTable({
  caption,
  rows,
  firstHeader,
  lastHeader,
}: {
  caption: string;
  rows: StatusMonthRow[];
  firstHeader: string;
  lastHeader: string;
}) {
  return (
    <div className="overflow-x-auto rounded-md border bg-card">
      <table className="w-max min-w-full border-collapse text-[11px] leading-tight sm:text-xs">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b bg-muted/50 text-muted-foreground">
          <tr>
            <th scope="col" className="sticky left-0 z-10 bg-muted/50 px-2 py-1 text-left font-medium whitespace-nowrap">
              {firstHeader}
            </th>
            {MONTHS.map((label) => (
              <th key={label} scope="col" className="px-1.5 py-1 text-right font-medium whitespace-nowrap">
                {label}
              </th>
            ))}
            <th scope="col" className="px-2 py-1 text-right font-medium whitespace-nowrap">
              {lastHeader}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card px-2 py-0.5 text-left font-medium whitespace-nowrap"
              >
                {row.label}
              </th>
              {row.months.map((value, i) => (
                <td key={MONTHS[i]} className="px-1.5 py-0.5 text-right tabular-nums whitespace-nowrap">
                  {formatNum(value)}
                </td>
              ))}
              <td className="px-2 py-0.5 text-right font-medium tabular-nums whitespace-nowrap">{formatNum(row.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WorkOverviewCards({ locale, status }: { locale: Locale; status: WorkStatusTables }) {
  const empty = status.contracts.every((row) => row.total === 0) && status.paid.total === 0 && status.unpaid.total === 0;

  return (
    <div className="mx-auto flex max-w-[1100px] flex-col gap-2.5 px-3 py-2 sm:px-4 sm:py-3">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h1 className="font-serif text-base text-primary sm:text-lg">{t(locale, "work.overview")}</h1>
        {status.syncedAt ? (
          <p className="text-[11px] text-muted-foreground">
            {t(locale, "work.copiedAt", { when: new Date(status.syncedAt).toLocaleString("ko-KR") })}
          </p>
        ) : null}
        {empty ? <p className="w-full text-xs text-muted-foreground">{t(locale, "work.empty")}</p> : null}
      </header>

      <section className="space-y-1">
        <h2 className="text-sm font-medium text-primary">{t(locale, "work.contractCount")}</h2>
        <StatusTable
          caption={t(locale, "work.contractCount")}
          firstHeader={t(locale, "work.statusPeriod")}
          lastHeader={t(locale, "work.colTotal")}
          rows={status.contracts}
        />
        {status.undatedContracts > 0 ? (
          <p className="text-[11px] text-muted-foreground">
            {t(locale, "work.statusUndated", { n: formatNum(status.undatedContracts) })}
          </p>
        ) : null}
      </section>

      <section className="space-y-1">
        <h2 className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-primary">
          <span>{t(locale, "work.statusPaidHeadline")}</span>
          <span className="font-serif text-lg tabular-nums">{formatNum(status.paidCount)}</span>
        </h2>
        <StatusTable
          caption={t(locale, "work.statusPaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={[status.paid]}
        />
      </section>

      <section className="space-y-1">
        <h2 className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-primary">
          <span>{t(locale, "work.statusUnpaidHeadline")}</span>
          <span className="font-serif text-lg tabular-nums">{formatNum(status.unpaidCount)}</span>
        </h2>
        <StatusTable
          caption={t(locale, "work.statusUnpaidTable")}
          firstHeader={t(locale, "work.statusAmount")}
          lastHeader={t(locale, "work.colGrand")}
          rows={[status.unpaid]}
        />
      </section>
    </div>
  );
}

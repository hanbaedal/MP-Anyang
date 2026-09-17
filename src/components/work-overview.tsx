import { t } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n";
import { isWorkEmpty, type WorkOverview } from "@/lib/work";

function won(locale: Locale, n: number) {
  return t(locale, "work.won", { n: n.toLocaleString("ko-KR") });
}

export function WorkOverviewCards({ locale, overview }: { locale: Locale; overview: WorkOverview }) {
  const empty = isWorkEmpty(overview);
  const items = [
    { key: "work.contractCount", value: String(overview.contractCount) },
    { key: "work.paidCount", value: String(overview.paidCount) },
    { key: "work.paidAmount", value: won(locale, overview.paidAmount) },
    { key: "work.unpaidCount", value: String(overview.unpaidCount) },
    { key: "work.unpaidAmount", value: won(locale, overview.unpaidAmount) },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-10">
      <h1 className="font-serif text-xl text-primary">{t(locale, "work.overview")}</h1>
      {empty ? (
        <p className="rounded-lg border bg-card px-4 py-4 text-sm text-muted-foreground">{t(locale, "work.empty")}</p>
      ) : null}
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.key} className="rounded-xl border bg-card px-4 py-4">
            <p className="text-sm text-muted-foreground">{t(locale, item.key)}</p>
            <p className="mt-1 font-serif text-2xl text-primary">{item.value}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

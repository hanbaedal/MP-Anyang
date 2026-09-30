import { SupervisorBaseBook } from "@/components/supervisor-base-book";
import { BASE_TABS, plotValues } from "@/lib/base-book";
import { ledgerWindow } from "@/components/supervisor-ledger";
import { requireSupervisor } from "@/lib/auth";
import type { BaseKind } from "@/lib/cemetery-parse";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readBaseItems, readStoredCemetery } from "@/lib/work-store";

export const dynamic = "force-dynamic";

const KINDS = new Set<BaseKind>(["cost", "stone", "company", "user", "consult"]);

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.master") };
}

export default async function SupervisorBasePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; tomb?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const params = await searchParams;
  const tab = params.tab === "plot" || KINDS.has(params.tab as BaseKind) ? (params.tab as BaseKind | "plot") : "plot";
  const tomb = params.tomb?.trim() ?? "";
  const spec = BASE_TABS.find((item) => item.kind === tab) ?? BASE_TABS[0];
  const rows =
    tab === "plot"
      ? (await readStoredCemetery())
          .filter((row) => !tomb || row.tombNo.includes(tomb))
          .sort((a, b) => a.tombNo.localeCompare(b.tombNo, "ko"))
          .map((row) => ({ key: row.tombNo, values: plotValues(row) }))
      : (await readBaseItems(tab))
          .filter((row) => !tomb || row.values.join(" ").includes(tomb))
          .map((row) => ({ key: `${row.kind}-${row.key}`, values: row.values }));
  const window = ledgerWindow(rows.length, params.pg);
  return (
    <SupervisorBaseBook
      action="/supervisor/base"
      tab={tab}
      tomb={tomb}
      page={window.page}
      pages={window.pages}
      total={rows.length}
      columns={spec.columns}
      rows={rows.slice(window.from, window.from + window.size)}
    />
  );
}

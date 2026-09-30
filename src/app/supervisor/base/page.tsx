import { SupervisorBaseBook, type BaseRow } from "@/components/supervisor-base-book";
import { ledgerWindow } from "@/components/supervisor-ledger";
import { requireSupervisor } from "@/lib/auth";
import { BASE_FORMS, BASE_TABS, plotFields, plotValues } from "@/lib/base-book";
import type { BaseItem, BaseKind } from "@/lib/cemetery-parse";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readBaseItems, readStoredCemetery } from "@/lib/work-store";

export const dynamic = "force-dynamic";

const KINDS = new Set<BaseKind>(["cost", "stone", "company", "user", "consult"]);

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.master") };
}

function detailFor(kind: BaseKind | "plot", fields: Record<string, string>) {
  return BASE_FORMS[kind].map((field) => {
    const stored = fields[field.name] ?? "";
    const value = field.name === "사진" && stored ? `${stored}장` : stored;
    return { label: field.label, value, wide: field.wide };
  });
}

function itemFields(row: BaseItem) {
  const fields = { ...(row.fields ?? {}) };
  if (!fields.code) fields.code = row.values[0] ?? row.key;
  if (row.kind === "user" && !fields.joined) fields.joined = row.values[2] ?? "";
  if (row.kind === "cost" || row.kind === "stone") {
    BASE_FORMS[row.kind].forEach((field, index) => {
      if (!fields[field.name] && row.values[index]) fields[field.name] = row.values[index];
    });
  }
  return fields;
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
  const rows: BaseRow[] =
    tab === "plot"
      ? (await readStoredCemetery())
          .filter((row) => !tomb || row.tombNo.includes(tomb))
          .sort((a, b) => a.tombNo.localeCompare(b.tombNo, "ko"))
          .map((row) => ({ key: row.tombNo, values: plotValues(row), detail: detailFor("plot", plotFields(row)) }))
      : (await readBaseItems(tab))
          .filter((row) => !tomb || (row.values[spec.searchAt] ?? "").includes(tomb))
          .map((row) => ({
            key: `${row.kind}-${row.key}`,
            values: row.values,
            detail: detailFor(tab, itemFields(row)),
          }));
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

import { SupervisorLedger, ledgerWindow } from "@/components/supervisor-ledger";
import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDumpBySlice } from "@/lib/work-store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.master") };
}

export default async function SupervisorBasePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const dump = await readWorkDumpBySlice("full");
  const found = dump.cemetery.filter((row) => {
    if (!query) return true;
    return [row.tombNo, row.location, row.inUse, row.pyeong].join(" ").includes(query);
  });
  const window = ledgerWindow(found.length, params.pg);
  const rows = found.slice(window.from, window.from + window.size).map((row) => [row.tombNo, row.pyeong, row.location, row.inUse]);
  return (
    <SupervisorLedger
      title={t(locale, "work.master")}
      action="/supervisor/base"
      query={query}
      placeholder="묘지번호, 위치"
      total={found.length}
      page={window.page}
      pages={window.pages}
      columns={["묘지번호", "평수", "위치", "사용"]}
      rows={rows}
    />
  );
}

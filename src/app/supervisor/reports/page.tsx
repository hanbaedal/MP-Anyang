import { SupervisorLedger, ledgerWindow } from "@/components/supervisor-ledger";
import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkDumpBySlice } from "@/lib/work-store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.reports") };
}

export default async function SupervisorReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pg?: string }>;
}) {
  await requireSupervisor();
  const locale = await readLocale();
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const dump = await readWorkDumpBySlice("reports");
  const found = dump.reports.filter((row) => {
    if (!query) return true;
    return [row.date, row.claimMaterial, row.inboundMaterial, row.note].join(" ").includes(query);
  });
  const window = ledgerWindow(found.length, params.pg);
  const rows = found.slice(window.from, window.from + window.size).map((row) => [
    row.date,
    String(row.handledCount || ""),
    row.claimMaterial,
    row.inboundMaterial,
    row.note,
  ]);
  return (
    <SupervisorLedger
      title={t(locale, "work.reports")}
      action="/supervisor/reports"
      query={query}
      placeholder="작성일자, 자재, 특기사항"
      total={found.length}
      page={window.page}
      pages={window.pages}
      columns={["작성일자", "처리건수", "청구자재", "입고자재", "특기사항"]}
      rows={rows}
    />
  );
}

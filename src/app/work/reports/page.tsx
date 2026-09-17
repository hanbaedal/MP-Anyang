import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { WorkCopiedTable } from "@/components/work-copied-table";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage, workCopyLead } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.reports") };
}

export default async function WorkReportsPage() {
  const { locale, session, dump, envReady } = await loadWorkCopyPage("reports");
  const rows = dump.reports.map((row) => ({
    date: row.date,
    handledCount: String(row.handledCount),
    claimMaterial: row.claimMaterial,
    inboundMaterial: row.inboundMaterial,
    note: row.note,
  }));
  return (
    <WorkCopiedTable
      title={t(locale, "work.reports")}
      lead={workCopyLead(rows.length)}
      syncedAt={dump.meta?.syncedAt}
      columns={[
        { key: "date", label: "작성일자" },
        { key: "handledCount", label: "처리건수", numeric: true },
        { key: "claimMaterial", label: "청구자재" },
        { key: "inboundMaterial", label: "입고자재" },
        { key: "note", label: "특기사항" },
      ]}
      rows={rows}
      empty={<WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />}
    />
  );
}

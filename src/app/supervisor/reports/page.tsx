import { SupervisorReportList } from "@/components/supervisor-report-list";
import { requireSupervisor } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readStoredReports } from "@/lib/work-store";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.reports") };
}

export default async function SupervisorReportsPage() {
  await requireSupervisor();
  const rows = (await readStoredReports()).sort((a, b) => b.date.localeCompare(a.date));
  return <SupervisorReportList rows={rows} />;
}

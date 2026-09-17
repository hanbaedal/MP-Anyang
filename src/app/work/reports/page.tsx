import { WorkStub } from "@/components/work-stub";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.reports") };
}

export default async function WorkReportsPage() {
  return <WorkStub titleKey="work.reports" />;
}

import { WorkOverviewCards } from "@/components/work-overview";
import { requireStatusStaff } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkStatus } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.overview") };
}

export default async function WorkOverviewPage() {
  const locale = await readLocale();
  await requireStatusStaff();
  const status = await readWorkStatus();
  return <WorkOverviewCards locale={locale} status={status} />;
}

import { WorkOverviewCards } from "@/components/work-overview";
import { requireCeo } from "@/lib/auth";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { readWorkOverview } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.overview") };
}

export default async function WorkOverviewPage() {
  const locale = await readLocale();
  await requireCeo();
  const overview = await readWorkOverview();
  return <WorkOverviewCards locale={locale} overview={overview} />;
}

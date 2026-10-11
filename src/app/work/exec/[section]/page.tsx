import { notFound } from "next/navigation";
import { ExecSectionPage } from "@/components/work-overview";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { execNavItem, isExecSection } from "@/lib/exec-nav";
import { readWorkStatus } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const locale = await readLocale();
  if (!isExecSection(section)) return { title: t(locale, "work.overview") };
  return { title: `${t(locale, "work.overview")} · ${t(locale, execNavItem(section).i18n)}` };
}

export default async function ExecSectionRoute({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!isExecSection(section)) notFound();
  const locale = await readLocale();
  const status = await readWorkStatus();
  return <ExecSectionPage locale={locale} status={status} section={section} />;
}

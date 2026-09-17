import { WorkStub } from "@/components/work-stub";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.fees") };
}

export default async function WorkFeesPage() {
  return <WorkStub titleKey="work.fees" />;
}

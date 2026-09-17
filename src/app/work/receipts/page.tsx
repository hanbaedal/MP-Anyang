import { WorkStub } from "@/components/work-stub";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.receipts") };
}

export default async function WorkReceiptsPage() {
  return <WorkStub titleKey="work.receipts" />;
}

import { WorkOrdersPanel } from "@/components/work-orders-panel";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.orders") };
}

export default async function WorkOrdersPage() {
  const locale = await readLocale();
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 pb-28">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "work.orders")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(locale, "work.ordersLead")}</p>
      </div>
      <WorkOrdersPanel />
    </div>
  );
}

import { DbUpdateButton } from "@/components/db-update-button";
import { requireSupervisor } from "@/lib/auth";
import { sourceEnvReady } from "@/lib/cemetery-source";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.dbUpdate") };
}

export default async function WorkSyncPage() {
  const locale = await readLocale();
  await requireSupervisor();
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "work.dbUpdate")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(locale, "work.sourceLead")}</p>
        <p className="mt-1 text-sm text-muted-foreground">{t(locale, "work.sourceSyncLists")}</p>
      </div>
      <DbUpdateButton envReady={sourceEnvReady()} />
    </div>
  );
}

import { WorkCopyEmpty } from "@/components/work-copy-empty";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.receipts") };
}

export default async function WorkReceiptsPage() {
  const { locale, session, dump, envReady } = await loadWorkCopyPage();
  const n = dump.receipts.length.toLocaleString("ko-KR");
  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 pb-28">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "work.receipts")}</h1>
        {dump.meta?.syncedAt ? (
          <p className="mt-1 text-xs text-muted-foreground">
            복사 시각 {new Date(dump.meta.syncedAt).toLocaleString("ko-KR")}
          </p>
        ) : null}
      </div>
      {dump.receipts.length === 0 ? (
        <WorkCopyEmpty locale={locale} role={session.role} envReady={envReady} storage={dump.storage} />
      ) : (
        <p className="rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">
          {t(locale, "work.receiptsOpinion", { n })}
        </p>
      )}
    </div>
  );
}

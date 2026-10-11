import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function WorkStub({ titleKey }: { titleKey: string }) {
  const locale = await readLocale();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-xl text-primary">{t(locale, titleKey)}</h1>
      <p className="mt-4 rounded-lg border bg-card px-4 py-6 text-sm text-muted-foreground">{t(locale, "work.stubLead")}</p>
    </div>
  );
}

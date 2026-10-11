import { WorkStatementForm } from "@/components/work-statement-form";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";
import { loadWorkCopyPage } from "@/lib/work";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "work.statements") };
}

export default async function WorkStatementsPage() {
  const { locale, dump } = await loadWorkCopyPage("contracts");

  return (
    <div className="mx-auto max-w-6xl space-y-4 px-4 py-8 pb-28 min-[1600px]:max-w-[100rem]">
      <div>
        <h1 className="font-serif text-xl text-primary">{t(locale, "work.statements")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t(locale, "work.statementsLead")}</p>
      </div>
      <WorkStatementForm contracts={dump.contracts} />
    </div>
  );
}

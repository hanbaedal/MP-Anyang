import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { SaleSteps } from "@/components/sale-steps";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "proc.title") };
}

export default async function ProcedurePage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "proc.kicker")} title={t(locale, "proc.title")} lead={t(locale, "proc.lead")} />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <SaleSteps />
        <Prose>
          <p>
            {t(locale, "proc.consult", { phone: SITE.phone })}{" "}
            <Link href="/support/inquiry" className="text-primary underline-offset-4 hover:underline">
              {t(locale, "proc.form")}
            </Link>
            {t(locale, "proc.after")}
          </p>
          <p>{t(locale, "proc.twoDays")}</p>
          <p>
            <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
        </Prose>
      </div>
    </>
  );
}

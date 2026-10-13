import Link from "next/link";
import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { SaleSteps } from "@/components/sale-steps";
import { getCmsPageLocalized } from "@/lib/cms";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "proc.title") };
}

export default async function ProcedurePage() {
  const locale = await readLocale();
  const cms = await getCmsPageLocalized("procedure", locale);
  const steps = (cms.items ?? []).map((item, index) => ({
    n: String(index + 1),
    title: item.title,
    text: item.text ?? "",
  }));

  return (
    <>
      <PageHero
        kicker={t(locale, "proc.kicker")}
        title={cms.title || t(locale, "proc.title")}
        lead={cms.lead || t(locale, "proc.lead")}
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <SaleSteps steps={steps.length ? steps : undefined} />
        <Prose>
          {cms.body?.trim() ? (
            <Paragraphs text={cms.body} />
          ) : (
            <>
              <p>
                {t(locale, "proc.consult", { phone: SITE.phone })}{" "}
                <Link href="/support/inquiry" className="text-primary underline-offset-4 hover:underline">
                  {t(locale, "proc.form")}
                </Link>
                {t(locale, "proc.after")}
              </p>
              <p>{t(locale, "proc.twoDays")}</p>
            </>
          )}
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

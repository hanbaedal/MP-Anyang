import { InquiryForm } from "@/components/inquiry-form";
import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "inquiry.title") };
}

export default async function InquiryPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "inquiry.kicker")} title={t(locale, "inquiry.title")} lead={t(locale, "inquiry.lead")} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1fr_1.1fr]">
        <Prose>
          <h2 className="text-xl">{t(locale, "inquiry.phoneHeading")}</h2>
          <p>
            <a className="text-lg font-medium text-primary" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
          <p>{SITE.addressAlt}</p>
        </Prose>
        <InquiryForm />
      </div>
    </>
  );
}

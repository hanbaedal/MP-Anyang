import { PageHero, Prose } from "@/components/page-hero";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "fees.title") };
}

export default async function FeesPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "fees.kicker")} title={t(locale, "fees.title")} lead={t(locale, "fees.lead")} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "fees.p1")}</p>
          <p>{t(locale, "fees.p2")}</p>
          <p>{t(locale, "fees.p3")}</p>
          <p>{t(locale, "fees.p4")}</p>
        </Prose>
      </div>
    </>
  );
}

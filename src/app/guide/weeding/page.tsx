import { PageHero, Prose } from "@/components/page-hero";
import { WeedingForm } from "@/components/weeding-form";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "weeding.title") };
}

export default async function WeedingPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "weeding.kicker")} title={t(locale, "weeding.title")} lead={t(locale, "weeding.lead")} />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-2">
        <Prose>
          <p>{t(locale, "weeding.body")}</p>
          <p>
            {t(locale, "weeding.urgent", { phone: SITE.phone }).split(SITE.phone).map((part, i) =>
              i === 0 ? (
                <span key="a">{part}</span>
              ) : (
                <span key="b">
                  <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
                    {SITE.phone}
                  </a>
                  {part}
                </span>
              ),
            )}
          </p>
        </Prose>
        <WeedingForm />
      </div>
    </>
  );
}

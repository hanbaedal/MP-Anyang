import { PageHero, Prose } from "@/components/page-hero";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "greeting.title") };
}

export default async function GreetingPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "greeting.kicker")}
        title={t(locale, "greeting.title")}
        lead={t(locale, "greeting.lead")}
        image={{ src: "/images/hero.jpg", alt: t(locale, "greeting.title") }}
      />
      <article className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "greeting.p1")}</p>
          <p>{t(locale, "greeting.p2")}</p>
          <p>{t(locale, "greeting.p3")}</p>
          <p>{t(locale, "greeting.thanks")}</p>
          <p className="font-medium text-primary">{t(locale, "greeting.sign")}</p>
        </Prose>
      </article>
    </>
  );
}

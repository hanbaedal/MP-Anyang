import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { getCmsPage } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "greeting.title") };
}

export default async function GreetingPage() {
  const locale = await readLocale();
  const cms = await getCmsPage("greeting");
  return (
    <>
      <PageHero
        kicker={t(locale, "greeting.kicker")}
        title={cms?.title || t(locale, "greeting.title")}
        lead={cms?.lead || t(locale, "greeting.lead")}
        image={{ src: "/images/hero.jpg", alt: t(locale, "greeting.title") }}
      />
      <article className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {cms?.body ? (
            <Paragraphs text={cms.body} />
          ) : (
            <>
              <p>{t(locale, "greeting.p1")}</p>
              <p>{t(locale, "greeting.p2")}</p>
              <p>{t(locale, "greeting.p3")}</p>
              <p>{t(locale, "greeting.thanks")}</p>
              <p className="font-medium text-primary">{t(locale, "greeting.sign")}</p>
            </>
          )}
        </Prose>
      </article>
    </>
  );
}

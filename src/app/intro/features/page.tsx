import { PageHero } from "@/components/page-hero";
import { FEATURES } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "features.title") };
}

export default async function FeaturesPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "features.kicker")}
        title={t(locale, "features.title")}
        lead={t(locale, "features.lead")}
        image={{ src: "/images/park-overview.jpg", alt: t(locale, "features.title") }}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <article key={feature.titleKey} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl">{t(locale, feature.titleKey)}</h2>
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{t(locale, feature.bodyKey)}</p>
          </article>
        ))}
      </div>
    </>
  );
}

import { PageHero } from "@/components/page-hero";
import { FEATURES } from "@/lib/site";
import { getCmsPage } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "features.title") };
}

export default async function FeaturesPage() {
  const locale = await readLocale();
  const cms = await getCmsPage("features");
  const items = cms?.items?.length
    ? cms.items
    : FEATURES.map((feature) => ({ id: feature.titleKey, title: t(locale, feature.titleKey), text: t(locale, feature.bodyKey) }));
  return (
    <>
      <PageHero
        kicker={t(locale, "features.kicker")}
        title={cms?.title || t(locale, "features.title")}
        lead={cms?.lead || t(locale, "features.lead")}
        image={{ src: "/images/park-overview.jpg", alt: t(locale, "features.title") }}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {items.map((item) => (
          <article key={item.id || item.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl">{item.title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{item.text}</p>
          </article>
        ))}
      </div>
    </>
  );
}

import { ExpandablePhoto } from "@/components/expandable-photo";
import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { REMODEL_TYPES } from "@/lib/content";
import { getCmsPage } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "remodel.title") };
}

export default async function RemodelPage() {
  const locale = await readLocale();
  const cms = await getCmsPage("remodeling");
  const items = cms?.items?.length
    ? cms.items
    : REMODEL_TYPES.map((item) => ({ id: item.title, title: item.title, text: item.text, image: item.image }));
  return (
    <>
      <PageHero
        kicker={t(locale, "remodel.kicker")}
        title={cms?.title || t(locale, "remodel.title")}
        lead={cms?.lead || t(locale, "remodel.lead")}
        image={{ src: "/images/remodel.jpg", alt: t(locale, "remodel.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {cms?.body ? (
            <Paragraphs text={cms.body} />
          ) : (
            <>
              <p>{t(locale, "remodel.body")}</p>
              <p className="text-sm text-muted-foreground">{t(locale, "remodel.cost")}</p>
            </>
          )}
        </Prose>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id || item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {item.image ? <ExpandablePhoto src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" /> : null}
              <div className="p-4">
                <h2 className="text-lg">{item.title}</h2>
                {item.text ? <p className="mt-2 text-sm text-muted-foreground">{item.text}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

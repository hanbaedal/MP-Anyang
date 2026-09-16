import { PageHero, Photo, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { BURIAL } from "@/lib/content";
import { getCmsPage } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "burial.title") };
}

export default async function BurialPage() {
  const locale = await readLocale();
  const cms = await getCmsPage("burial");
  const items = cms?.items?.length
    ? cms.items
    : BURIAL.map((item) => ({ id: item.title, title: item.title, text: item.caption, image: item.image }));
  return (
    <>
      <PageHero
        kicker={t(locale, "burial.kicker")}
        title={cms?.title || t(locale, "burial.title")}
        lead={cms?.lead || t(locale, "burial.lead")}
        image={{ src: "/images/burial.jpg", alt: t(locale, "burial.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>{cms?.body ? <Paragraphs text={cms.body} /> : <p>{t(locale, "burial.body")}</p>}</Prose>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id || item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {item.image ? <Photo src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" /> : null}
              <div className="p-4">
                <h2 className="text-lg">{item.title}</h2>
                {item.text ? <p className="mt-1 text-sm text-muted-foreground">{item.text}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

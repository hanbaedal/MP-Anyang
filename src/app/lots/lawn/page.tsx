import { ExpandablePhoto } from "@/components/expandable-photo";
import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { LAWN } from "@/lib/content";
import { getCmsPage } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "lawn.title") };
}

export default async function LawnPage() {
  const locale = await readLocale();
  const cms = await getCmsPage("lawn");
  const items = cms?.items?.length ? cms.items : LAWN.map((item) => ({ id: item.title, title: item.title, image: item.image }));
  return (
    <>
      <PageHero
        kicker={t(locale, "lawn.kicker")}
        title={cms?.title || t(locale, "lawn.title")}
        lead={cms?.lead || t(locale, "lawn.lead")}
        image={{ src: "/images/lawn.jpg", alt: t(locale, "lawn.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>{cms?.body ? <Paragraphs text={cms.body} /> : <p>{t(locale, "lawn.body")}</p>}</Prose>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id || item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              {item.image ? <ExpandablePhoto src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" /> : null}
              <h2 className="p-4 text-lg">{item.title}</h2>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

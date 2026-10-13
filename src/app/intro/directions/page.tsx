import { DirectionsMap } from "@/components/directions-map";
import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
import { getCmsPageLocalized } from "@/lib/cms";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "dir.title") };
}

export default async function DirectionsPage() {
  const locale = await readLocale();
  const cms = await getCmsPageLocalized("directions", locale);
  const items = cms.items?.length
    ? cms.items
    : [
        { id: "car", title: t(locale, "dir.car"), text: t(locale, "dir.carBody") },
        { id: "bus", title: t(locale, "dir.bus"), text: t(locale, "dir.busBody") },
        { id: "taxi", title: t(locale, "dir.taxi"), text: t(locale, "dir.taxiBody") },
        { id: "alt", title: t(locale, "dir.alt"), text: `${t(locale, "site.address")}\n${SITE.phone}` },
      ];

  const transport = items.slice(0, 3);
  const rest = items.slice(3);

  return (
    <>
      <PageHero
        kicker={t(locale, "dir.kicker")}
        title={cms.title || t(locale, "dir.title")}
        lead={cms.lead || t(locale, "dir.lead")}
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <DirectionsMap />
        <div className="grid gap-8 md:grid-cols-3">
          {transport.map((item) => (
            <Prose key={item.id || item.title}>
              <h2 className="text-xl">{item.title}</h2>
              {item.text ? <Paragraphs text={item.text} /> : null}
            </Prose>
          ))}
        </div>
        {rest.map((item) => (
          <Prose key={item.id || item.title}>
            <h2 className="text-xl">{item.title}</h2>
            {item.text ? <Paragraphs text={item.text} /> : null}
            <p>
              <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
                {SITE.phone}
              </a>
            </p>
          </Prose>
        ))}
        {cms.body?.trim() ? (
          <Prose>
            <Paragraphs text={cms.body} />
          </Prose>
        ) : null}
      </div>
    </>
  );
}

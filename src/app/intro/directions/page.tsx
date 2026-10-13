import { DirectionsMap } from "@/components/directions-map";
import { PageHero, Prose } from "@/components/page-hero";
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
          {items.slice(0, 3).map((item) => (
            <Prose key={item.id || item.title}>
              <h2 className="text-xl">{item.title}</h2>
              {(item.text || "").split(/\n\n+/).map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </Prose>
          ))}
        </div>
        {items.slice(3).map((item) => (
          <Prose key={item.id || item.title}>
            <h2 className="text-xl">{item.title}</h2>
            {(item.text || "").split(/\n+/).map((line) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              if (/^\d[\d\-\u2011]+\d$/.test(trimmed.replace(/\s/g, "")) || trimmed.includes("031")) {
                return (
                  <p key={trimmed}>
                    <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
                      {trimmed}
                    </a>
                  </p>
                );
              }
              return <p key={trimmed}>{trimmed}</p>;
            })}
          </Prose>
        ))}
        {cms.body?.trim()
          ? cms.body
              .split(/\n\n+/)
              .filter(Boolean)
              .map((para) => (
                <Prose key={para.slice(0, 32)}>
                  <p>{para}</p>
                </Prose>
              ))
          : null}
      </div>
    </>
  );
}

import { PageHero, Prose } from "@/components/page-hero";
import { getCmsPageLocalized } from "@/lib/cms";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "fees.title") };
}

export default async function FeesPage() {
  const locale = await readLocale();
  const cms = await getCmsPageLocalized("fees", locale);
  const paragraphs = (cms.body || "").split(/\n\n+/).filter(Boolean);
  const fallback = [t(locale, "fees.p1"), t(locale, "fees.p2"), t(locale, "fees.p3"), t(locale, "fees.p4")];

  return (
    <>
      <PageHero
        kicker={t(locale, "fees.kicker")}
        title={cms.title || t(locale, "fees.title")}
        lead={cms.lead || t(locale, "fees.lead")}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          {(paragraphs.length ? paragraphs : fallback).map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
        </Prose>
      </div>
    </>
  );
}

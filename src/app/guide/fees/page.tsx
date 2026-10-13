import { PageHero, Prose } from "@/components/page-hero";
import { Paragraphs } from "@/components/paragraphs";
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
  const body =
    cms.body?.trim() ||
    [t(locale, "fees.p1"), t(locale, "fees.p2"), t(locale, "fees.p3"), t(locale, "fees.p4")].join("\n");

  return (
    <>
      <PageHero
        kicker={t(locale, "fees.kicker")}
        title={cms.title || t(locale, "fees.title")}
        lead={cms.lead || t(locale, "fees.lead")}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <Paragraphs text={body} />
        </Prose>
      </div>
    </>
  );
}

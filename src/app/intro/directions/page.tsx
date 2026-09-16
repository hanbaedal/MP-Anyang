import { DirectionsMap } from "@/components/directions-map";
import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "dir.title") };
}

export default async function DirectionsPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero kicker={t(locale, "dir.kicker")} title={t(locale, "dir.title")} lead={t(locale, "dir.lead")} />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <DirectionsMap />
        <div className="grid gap-8 md:grid-cols-3">
          <Prose>
            <h2 className="text-xl">{t(locale, "dir.car")}</h2>
            <p>{t(locale, "dir.carBody")}</p>
          </Prose>
          <Prose>
            <h2 className="text-xl">{t(locale, "dir.bus")}</h2>
            <p>{t(locale, "dir.busBody")}</p>
          </Prose>
          <Prose>
            <h2 className="text-xl">{t(locale, "dir.taxi")}</h2>
            <p>{t(locale, "dir.taxiBody")}</p>
          </Prose>
        </div>
        <Prose>
          <h2 className="text-xl">{t(locale, "dir.alt")}</h2>
          <p>{SITE.addressAlt}</p>
          <p>
            <a className="text-primary underline-offset-4 hover:underline" href={SITE.phoneTel}>
              {SITE.phone}
            </a>
          </p>
        </Prose>
      </div>
    </>
  );
}

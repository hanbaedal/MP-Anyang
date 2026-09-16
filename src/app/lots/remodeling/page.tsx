import { PageHero, Photo, Prose } from "@/components/page-hero";
import { REMODEL_TYPES } from "@/lib/content";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "remodel.title") };
}

export default async function RemodelPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "remodel.kicker")}
        title={t(locale, "remodel.title")}
        lead={t(locale, "remodel.lead")}
        image={{ src: "/images/remodel.jpg", alt: t(locale, "remodel.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "remodel.body")}</p>
          <p className="text-sm text-muted-foreground">{t(locale, "remodel.cost")}</p>
        </Prose>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {REMODEL_TYPES.map((item) => (
            <li key={item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Photo src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" />
              <div className="p-4">
                <h2 className="text-lg">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

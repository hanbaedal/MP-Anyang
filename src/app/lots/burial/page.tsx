import { PageHero, Photo, Prose } from "@/components/page-hero";
import { BURIAL } from "@/lib/content";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "burial.title") };
}

export default async function BurialPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "burial.kicker")}
        title={t(locale, "burial.title")}
        lead={t(locale, "burial.lead")}
        image={{ src: "/images/burial.jpg", alt: t(locale, "burial.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "burial.body")}</p>
        </Prose>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {BURIAL.map((item) => (
            <li key={item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Photo src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" />
              <div className="p-4">
                <h2 className="text-lg">{item.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{item.caption}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

import { PageHero, Photo, Prose } from "@/components/page-hero";
import { COLUMBARIUM } from "@/lib/content";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "col.title") };
}

export default async function ColumbariumPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "col.kicker")}
        title={t(locale, "col.title")}
        lead={t(locale, "col.lead")}
        image={{ src: "/images/columbarium.jpg", alt: t(locale, "col.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "col.body")}</p>
        </Prose>
        <ul className="mt-10 grid gap-5 md:grid-cols-3">
          {COLUMBARIUM.map((item) => (
            <li key={item.title} className="overflow-hidden rounded-xl border bg-card shadow-sm">
              <Photo src={item.image} alt={item.title} className="aspect-[4/3] rounded-none" />
              <h2 className="p-4 text-lg">{item.title}</h2>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

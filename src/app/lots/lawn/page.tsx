import { PageHero, Photo, Prose } from "@/components/page-hero";
import { LAWN } from "@/lib/content";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "lawn.title") };
}

export default async function LawnPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "lawn.kicker")}
        title={t(locale, "lawn.title")}
        lead={t(locale, "lawn.lead")}
        image={{ src: "/images/lawn.jpg", alt: t(locale, "lawn.title") }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>{t(locale, "lawn.body")}</p>
        </Prose>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {LAWN.map((item) => (
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

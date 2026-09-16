import { PageHero } from "@/components/page-hero";
import { SERVICES } from "@/lib/content";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

export async function generateMetadata() {
  const locale = await readLocale();
  return { title: t(locale, "svc.title") };
}

export default async function ServicesPage() {
  const locale = await readLocale();
  return (
    <>
      <PageHero
        kicker={t(locale, "svc.kicker")}
        title={t(locale, "svc.title")}
        lead={t(locale, "svc.lead")}
        image={{ src: "/images/remodel-before.jpg", alt: t(locale, "svc.title") }}
      />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-12">
        {SERVICES.map((service) => (
          <article key={service.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl">{service.title}</h2>
            {service.paragraphs.map((p) => (
              <p key={p} className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {p}
              </p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}

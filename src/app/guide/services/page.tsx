import { PageHero } from "@/components/page-hero";
import { t } from "@/lib/i18n";
import { readLocale } from "@/lib/i18n-server";

const SERVICE_KEYS = [
  { title: "svc.reloc.title", bodies: ["svc.reloc.p1", "svc.reloc.p2"] },
  { title: "svc.stone.title", bodies: ["svc.stone.p1"] },
  { title: "svc.turf.title", bodies: ["svc.turf.p1"] },
  { title: "svc.weed.title", bodies: ["svc.weed.p1"] },
  { title: "svc.design.title", bodies: ["svc.design.p1"] },
] as const;

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
        {SERVICE_KEYS.map((service) => (
          <article key={service.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl">{t(locale, service.title)}</h2>
            {service.bodies.map((key) => (
              <p key={key} className="mt-3 text-[15px] leading-7 text-muted-foreground">
                {t(locale, key)}
              </p>
            ))}
          </article>
        ))}
      </div>
    </>
  );
}

import { PageHero } from "@/components/page-hero";
import { SERVICES } from "@/lib/content";

export const metadata = { title: "서비스" };

export default function ServicesPage() {
  return (
    <>
      <PageHero
        kicker="이용안내"
        title="서비스"
        lead="이장·개장, 석축, 잔디, 특별관리, 묘지 디자인을 안내합니다."
        image={{ src: "/images/remodel-before.jpg", alt: "손질이 필요한 봉분" }}
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

import { PageHero } from "@/components/page-hero";
import { FEATURES } from "@/lib/site";

export const metadata = { title: "공원 특징" };

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        kicker="공원소개"
        title="공원 특징"
        lead="입지와 관리, 명절 방문길을 중심으로 안내합니다. 홈 제목에는 명당이라는 말을 쓰지 않습니다."
        image={{ src: "/images/park-overview.jpg", alt: "공원 전경" }}
      />
      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 md:grid-cols-2">
        {FEATURES.map((feature) => (
          <article key={feature.title} className="rounded-xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl">{feature.title}</h2>
            <p className="mt-3 text-[15px] leading-7 text-muted-foreground">{feature.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}

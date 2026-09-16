import { PageHero, Photo, Prose } from "@/components/page-hero";
import { BURIAL } from "@/lib/content";

export const metadata = { title: "매장묘" };

export default function BurialPage() {
  return (
    <>
      <PageHero
        kicker="분양안내"
        title="매장묘"
        lead="흙에 모시는 자리입니다. 분양 금액은 안내하지 않으며, 위수는 상담에서 확인합니다."
        image={{ src: "/images/burial.jpg", alt: "매장묘" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>한 분을 모시는 단장, 부부를 한자리에 모시는 합장(부부단), 부부 각자의 쌍분 가운데 고르실 수 있습니다.</p>
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

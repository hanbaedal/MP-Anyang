import { PageHero, Photo, Prose } from "@/components/page-hero";
import { LAWN } from "@/lib/content";

export const metadata = { title: "평장묘" };

export default function LawnPage() {
  return (
    <>
      <PageHero
        kicker="분양안내"
        title="평장묘"
        lead="잔디 위 평장입니다. 라이브에서 쓰는 위수 이름을 그대로 안내합니다."
        image={{ src: "/images/lawn.jpg", alt: "평장묘" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>
            고급평장묘 2위, 평장묘 2위, 평장묘 4·6·8위, 평장묘 12·16위, 평장묘 24위, 가로평장묘 16위, 대가족 평장묘가 있습니다. 그 이상 위수는 상담으로 안내합니다.
          </p>
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

import { PageHero, Photo, Prose } from "@/components/page-hero";
import { REMODEL_TYPES } from "@/lib/content";

export const metadata = { title: "리모델링" };

export default function RemodelPage() {
  return (
    <>
      <PageHero
        kicker="분양안내"
        title="리모델링"
        lead="쓰시던 묘를 가족묘로 다듬습니다. 서구매장, 가로형, 표준형이 있습니다."
        image={{ src: "/images/remodel.jpg", alt: "리모델링 가족묘" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>기존 묘를 손질하면 여러 고인을 한자리에 모시기 쉽고, 자리가 정갈해집니다.</p>
          <p className="text-sm text-muted-foreground">
            라이브 안내처럼, 신규 분양과 견주면 비용이 낮은 편(약 40~50% 수준)인 경우가 있습니다. 정확한 금액은 올리지 않으며 사무실에서 설명합니다.
          </p>
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

import { DirectionsMap } from "@/components/directions-map";
import { PageHero, Prose } from "@/components/page-hero";
import { SITE } from "@/lib/site";

export const metadata = { title: "오시는 길" };

export default function DirectionsPage() {
  return (
    <>
      <PageHero
        kicker="공원소개"
        title="오시는 길"
        lead={`${SITE.address}. 안산 상록구 양상동에 있습니다.`}
      />
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
        <DirectionsMap />
        <div className="grid gap-8 md:grid-cols-3">
          <Prose>
            <h2 className="text-xl">자가용</h2>
            <p>경부고속도로 → 외곽순환도로 → 영동고속도로 → 안산IC 진출 후 약 3분입니다.</p>
          </Prose>
          <Prose>
            <h2 className="text-xl">버스</h2>
            <p>4호선 중앙역 1번 출구에서 3-1, 35, 314번 버스를 타고 양상동입구에서 내리시면 됩니다. 노선은 개편 전에 한 번 더 확인하는 것이 좋습니다.</p>
          </Prose>
          <Prose>
            <h2 className="text-xl">택시</h2>
            <p>4호선 중앙역 1번 출구에서 택시를 타면 약 15분입니다.</p>
          </Prose>
        </div>
      </div>
    </>
  );
}

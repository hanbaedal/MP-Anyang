import { PageHero, Photo, Prose } from "@/components/page-hero";
import { COLUMBARIUM } from "@/lib/content";

export const metadata = { title: "봉안묘" };

export default function ColumbariumPage() {
  return (
    <>
      <PageHero
        kicker="분양안내"
        title="봉안묘"
        lead="유골을 모시는 자리입니다. 4~12위처럼 줄인 표는 쓰지 않습니다."
        image={{ src: "/images/columbarium.jpg", alt: "봉안묘" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Prose>
          <p>봉안묘 2~8위, 봉안묘 12~24위가 있으며 전경은 사진으로 확인하실 수 있습니다. 자세한 구좌는 현장에서 안내합니다.</p>
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

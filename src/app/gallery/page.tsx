import { GalleryGrid } from "@/components/gallery-grid";
import { PageHero } from "@/components/page-hero";

export const metadata = { title: "둘러보기" };

export default function GalleryPage() {
  return (
    <>
      <PageHero
        kicker="둘러보기"
        title="공원 갤러리"
        lead="전경과 종류별 사진을 한곳에서 봅니다. 전경 메뉴를 둘로 나누지 않았습니다."
        image={{ src: "/images/park-overview.jpg", alt: "공원 전경" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <GalleryGrid />
      </div>
    </>
  );
}

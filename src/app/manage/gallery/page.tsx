import { PageHero } from "@/components/page-hero";
import { ManageGallery } from "@/components/manage-gallery";
import { listGallery } from "@/lib/gallery";

export default async function ManageGalleryPage() {
  const items = await listGallery();
  return (
    <>
      <PageHero
        kicker="관리"
        title="갤러리"
        lead="일반·전경·종류별 사진을 올립니다. 「일반」은 공개 갤러리와 홈페이지 관리에서 함께 쓰며, 한글 설명 저장 시 영어·중국어가 자동 번역됩니다."
      />
      <ManageGallery initial={items} />
    </>
  );
}

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
        lead="일반·전경·종류별 사진을 올립니다. 「일반」 태그는 공개 갤러리와 홈페이지 관리(팝업·분양 사진)에서 함께 씁니다."
      />
      <ManageGallery initial={items} />
    </>
  );
}

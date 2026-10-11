import { PageHero } from "@/components/page-hero";
import { ManageGallery } from "@/components/manage-gallery";
import { listGallery } from "@/lib/gallery";

export default async function ManageGalleryPage() {
  const items = await listGallery();
  return (
    <>
      <PageHero kicker="관리" title="갤러리" lead="올린 파일은 public/uploads 에 저장됩니다. Render 디스크는 재배포 때 비워질 수 있습니다." />
      <ManageGallery initial={items} />
    </>
  );
}

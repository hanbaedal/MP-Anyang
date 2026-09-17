import { PageHero } from "@/components/page-hero";
import { ManageFuneralDocs } from "@/components/manage-funeral-docs";
import { listFuneralDocs } from "@/lib/funeral-docs";

export default async function ManageFuneralPage() {
  const items = await listFuneralDocs();
  return (
    <>
      <PageHero
        kicker="관리"
        title="장례·안치"
        lead="공공서류 PDF를 등록합니다. 공개 이용안내 › 장례·안치 페이지에서 내려받을 수 있습니다."
      />
      <ManageFuneralDocs initial={items} />
    </>
  );
}

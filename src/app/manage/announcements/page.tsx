import { PageHero } from "@/components/page-hero";
import { ManageAnnouncements } from "@/components/manage-announcements";
import { listAnnouncements } from "@/lib/announcements";

export default async function ManageAnnouncementsPage() {
  const items = await listAnnouncements();
  return (
    <>
      <PageHero
        kicker="관리"
        title="메인 이벤트·팝업"
        lead="포스터는 파일을 올리거나 갤러리 「일반」 사진을 골라 씁니다. 기간·ON/OFF · 메인(/) 모달"
      />
      <ManageAnnouncements initial={items} />
    </>
  );
}

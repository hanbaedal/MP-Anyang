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
        lead="메인 접속 시 모달로 띄울 소식·포스터를 등록합니다. 기간·사용 여부·닫기 동작을 설정할 수 있습니다."
      />
      <ManageAnnouncements initial={items} />
    </>
  );
}
